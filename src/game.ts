import {
  NUM_CARDS,
  NUM_SETS,
  CARDS_PER_SET,
  NUM_PLAYERS,
} from "./types";
import type { Move, GameData, SerializedGame } from "./types";

function checkNum(num: unknown, upper: number): boolean {
  const n = Number(num);
  return num === undefined || num === null || isNaN(n) || n < 0 || n >= upper;
}

function shuffle(array: number[]): number[] {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}

export class Game {
  private cards: number[];
  private numCards: number[];
  private numCardsBySet: number[][];
  private declares: number[];
  private declaresLog: number[];
  private moves: number[][];
  private scoreOdd: number;
  private scoreEven: number;
  private lastPlayer: number;
  private lastDeclarePlayer: number;
  private lastDeclareWasCorrect: boolean;
  private lastDeclareSet: number;
  readonly createdAt: number;

  constructor(serialized?: SerializedGame) {
    if (serialized) {
      this.cards = serialized.cards;
      this.numCards = serialized.numCards;
      this.numCardsBySet = serialized.numCardsBySet;
      this.declares = serialized.declares;
      this.declaresLog = serialized.declaresLog;
      this.moves = serialized.moves;
      this.scoreOdd = serialized.scoreOdd;
      this.scoreEven = serialized.scoreEven;
      this.lastPlayer = serialized.lastPlayer;
      this.lastDeclarePlayer = serialized.lastDeclarePlayer;
      this.lastDeclareWasCorrect = serialized.lastDeclareWasCorrect;
      this.lastDeclareSet = serialized.lastDeclareSet;
      this.createdAt = serialized.createdAt;
    } else {
      this.createdAt = Date.now();
      this.scoreOdd = 0;
      this.scoreEven = 0;
      this.lastPlayer = 0;
      this.lastDeclarePlayer = -1;
      this.lastDeclareWasCorrect = false;
      this.lastDeclareSet = -1;
      this.declares = Array(NUM_SETS).fill(-1);
      this.declaresLog = [];
      this.moves = [];
      this.numCards = Array(NUM_PLAYERS).fill(9);
      this.numCardsBySet = Array.from({ length: NUM_PLAYERS }, () =>
        Array(NUM_SETS).fill(0)
      );

      // Deal cards evenly across players: card i goes to player floor(i * 6 / 54)
      this.cards = Array.from({ length: NUM_CARDS }, (_, i) =>
        Math.floor((i * NUM_PLAYERS) / NUM_CARDS)
      );
      shuffle(this.cards);

      for (let i = 0; i < NUM_CARDS; i++) {
        const player = this.cards[i];
        const set = Math.floor(i / CARDS_PER_SET);
        this.numCardsBySet[player][set]++;
      }
    }
  }

  update(player: number, data: Move): void {
    if (data.type === "ask") {
      const { card, other } = data;
      // (1) Must be player's turn
      // (2) card and other must be in range
      // (4) must be asking opponent (different team)
      if (
        this.lastPlayer !== player ||
        checkNum(other, NUM_PLAYERS) ||
        checkNum(card, NUM_CARDS) ||
        player % 2 === other % 2
      ) return;

      const set = Math.floor(card / CARDS_PER_SET);
      // (5) opponent must have cards
      if (this.numCards[other] === 0) return;
      // (3) player must have a card in the set
      if (this.numCardsBySet[player][set] === 0) return;

      if (this.cards[card] === other) {
        // Transfer card to asking player
        this.cards[card] = player;
        this.numCards[player]++;
        this.numCardsBySet[player][set]++;
        this.numCards[other]--;
        this.numCardsBySet[other][set]--;
        this.moves.push([player, other, card, 1]);
      } else {
        // Wrong guess — turn passes to opponent
        this.lastPlayer = other;
        this.moves.push([player, other, card, 0]);
      }
    } else if (data.type === "declare") {
      const { set } = data;
      if (checkNum(set, NUM_SETS) || this.declares[set] !== -1) return;

      // Access the numeric card assignments via a record cast since
      // keys "0"–"5" are valid optional fields of DeclareMove.
      const declareRecord = data as unknown as Record<string, unknown>;

      // Validate all 6 card assignments are on the declaring player's team
      for (let i = 0; i < CARDS_PER_SET; i++) {
        const assigned = Number(declareRecord[String(i)]);
        if (checkNum(assigned, NUM_PLAYERS) || assigned % 2 !== player % 2) return;
      }

      // Check if the declaration is correct
      let success = true;
      for (let i = 0; i < CARDS_PER_SET; i++) {
        const card = set * CARDS_PER_SET + i;
        if (this.cards[card] !== Number(declareRecord[String(i)])) {
          success = false;
          break;
        }
      }

      this.lastDeclarePlayer = player;
      this.lastDeclareSet = set;
      this.lastDeclareWasCorrect = success;

      // Award point
      if (success) {
        if (player % 2 === 1) { this.scoreOdd++; this.declares[set] = 3; }
        else { this.scoreEven++; this.declares[set] = 2; }
      } else {
        // Wrong declare gives point to other team
        if (player % 2 === 1) { this.scoreEven++; this.declares[set] = 1; }
        else { this.scoreOdd++; this.declares[set] = 0; }
      }

      this.declaresLog.push(set);

      // Remove set from play
      for (let i = 0; i < NUM_PLAYERS; i++) {
        this.numCards[i] -= this.numCardsBySet[i][set];
        this.numCardsBySet[i][set] = 0;
      }
      for (let i = 0; i < CARDS_PER_SET; i++) {
        this.cards[set * CARDS_PER_SET + i] = -1;
      }
    } else if (data.type === "transfer") {
      const { other } = data;
      // Must be player's turn, other must be same team, other must be valid
      if (
        checkNum(other, NUM_PLAYERS) ||
        Number(other) % 2 !== player % 2 ||
        this.lastPlayer !== player
      ) return;

      this.lastPlayer = Number(other);
    }
  }

  getData(player: number): GameData {
    const playerCards: number[] = [];
    for (let i = 0; i < NUM_CARDS; i++) {
      if (this.cards[i] === player) playerCards.push(i);
    }

    return {
      cards: playerCards,
      lastMove: this.moves.length > 0 ? this.moves[this.moves.length - 1] : null,
      scoreOdd: this.scoreOdd,
      scoreEven: this.scoreEven,
      turn: this.lastPlayer,
      numCards: this.numCards,
      declares: this.declares,
      declaresLog: this.declaresLog,
      lastDeclare: {
        player: this.lastDeclarePlayer,
        set: this.lastDeclareSet,
        success: this.lastDeclareWasCorrect,
      },
    };
  }

  serialize(): SerializedGame {
    return {
      cards: this.cards,
      numCards: this.numCards,
      numCardsBySet: this.numCardsBySet,
      declares: this.declares,
      declaresLog: this.declaresLog,
      moves: this.moves,
      scoreOdd: this.scoreOdd,
      scoreEven: this.scoreEven,
      lastPlayer: this.lastPlayer,
      lastDeclarePlayer: this.lastDeclarePlayer,
      lastDeclareWasCorrect: this.lastDeclareWasCorrect,
      lastDeclareSet: this.lastDeclareSet,
      createdAt: this.createdAt,
    };
  }
}
