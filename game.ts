import * as util from './util';

/* Player 0 always starts */
class Game {
    public readonly time;

    private readonly cards: number[];
    private scoreOdd = 0;
    private scoreEven = 0;
    private lastPlayer = 0;
    private moves: number[][] = [];
    private readonly numCards: number[];
    private readonly numCardsBySet: number[][];

    private lastDeclarePlayer: number = -1;
    private lastDeclareWasCorrect: boolean = false;
    private lastDeclareSet: number = -1;

    /* -1 not declared 
    0 wrong even declare
    1 wrong odd declare
    2 correct even declare
    3 correct even declare*/
    private readonly declares: number[];
    private readonly declaresLog: number[];

    constructor() {
        this.time = Date.now();

        this.declares = [];
        this.declaresLog = [];
        for (let i = 0; i < util.numSets; ++i) {
            this.declares.push(-1);
        }

        this.numCards = [];
        this.numCardsBySet = [];

        for (let i = 0; i < util.numPlayers; ++i) {
            this.numCards.push(9);
            this.numCardsBySet.push([]);

            for (let j = 0; j < util.numSets; ++j) {
                this.numCardsBySet[i].push(0);
            }
        }

        this.cards = Array.apply(null, Array(util.numCards)).map((x, i) => {
            return Math.floor(i * util.numPlayers / (util.numCards));
        });

        util.shuffle(this.cards);

        for (let i = 0; i < util.numCards; ++i) {
            const player = this.cards[i];

            const card = i % util.cardsPerSet;
            const set = (i - card) / util.cardsPerSet;
            this.numCardsBySet[player][set] += 1;
        }

    };

    public update(player: number, data: any) {
        if (data.type === undefined) {
            return;
        }
        else if (data.type === "ask") {
            /*
            (1) Must be the players turn
            (2) data must be within range
            (3) must have a card in the set
            (4) the player they are asking must be on the other team
            (5) the player they are asking must have some cards
            */

            // (1) (2) (4)
            if (this.lastPlayer != player
                || util.checkNum(data.other, util.numPlayers)
                || util.checkNum(data.card, util.numCards)
                || player % 2 == data.other % 2) {
                return;
            }

            const card: number = data.card % util.cardsPerSet;
            const set: number = (data.card - card) / util.cardsPerSet;

            // (5)
            if (this.numCards[data.other] == 0) return;
            // (3)
            else if (this.numCardsBySet[player][set] == 0) return;

            /*  transfer the card */
            if (this.cards[data.card] == data.other) {
                this.cards[data.card] = player;
                this.moves.push([player, data.other, data.card, 1]);

                this.numCards[player] += 1;
                this.numCardsBySet[player][set] += 1;

                this.numCards[data.other] -= 1;
                this.numCardsBySet[data.other][set] -= 1;

            }
            /* dont transfer the card */
            else {
                this.lastPlayer = data.other;
                this.moves.push([player, data.other, data.card, 0]);
            }

            return;
        }
        else if (data.type === "declare") {
            // check that the set is valid and hasnt already been declared
            if (util.checkNum(data.set, util.numSets)
                || this.declares[data.set] != -1) {
                return;
            }

            for (let i = 0; i < util.cardsPerSet; ++i) {
                if (util.checkNum(data[i], util.numPlayers)
                || (+data[i] % 2) != (player % 2)) return;
            }

            let success: boolean = true;
            for (let i = 0; i < util.cardsPerSet; ++i) {
                const card: number = data.set * util.cardsPerSet + i;
                if (this.cards[card] != data[i]) {
                    success = false;
                    break;
                }
            }

            this.lastDeclarePlayer = player;
            this.lastDeclareSet = data.set;
            this.lastDeclareWasCorrect = success;

            if (success) {
                if (player % 2) {
                    ++this.scoreOdd;
                    this.declares[data.set] = 3;
                }
                else {
                    ++this.scoreEven;
                    this.declares[data.set] = 2;
                }
            }
            else {
                if (player % 2) {
                    ++this.scoreEven;
                    this.declares[data.set] = 1;
                }
                else {
                    ++this.scoreOdd;
                    this.declares[data.set] = 0;
                }
            }
            this.declaresLog.push(data.set);

            for (let i = 0; i < util.numPlayers; ++i) {
                this.numCards[i] -= this.numCardsBySet[i][data.set];
                this.numCardsBySet[i][data.set] = 0;
            }
            
            for (let i = 0; i < util.cardsPerSet; ++i) {
                const card: number = data.set * util.cardsPerSet + i;
                this.cards[card] = -1;
            }

        }
        else if (data.type === "transfer") {
            if (util.checkNum(data.other, util.numPlayers)
                || data.other % 2 != player % 2
                || this.numCards[player] != 0
                || this.lastPlayer != player) {
                return;
            }

            this.lastPlayer = data.other;

        }

        return;
    }

    private lastDeclareData() {
        return {
            player: this.lastDeclarePlayer,
            set: this.lastDeclareSet,
            success: this.lastDeclareWasCorrect
        };
    }
    
    public data(player: number) {
        const playerCards: number[] = [];
        for (let i = 0; i < util.numCards; ++i) {
            if (this.cards[i] == player) {
                playerCards.push(i);
            }
        }

        let lastMove;
        if (this.moves.length == null) lastMove = null;
        else {
            lastMove = this.moves[this.moves.length - 1];
        }

        return {
            cards: playerCards,
            lastMove: lastMove,
            scoreOdd: this.scoreOdd,
            scoreEven: this.scoreEven,
            turn: this.lastPlayer,
            numCards: this.numCards,
            declares: this.declares,
            declaresLog: this.declaresLog,
            lastDeclare: this.lastDeclareData()
        };
    }

}

export class GameManager {
    constructor() { };
    private games: { [id: string]: Game } = {};

    public remove(key: string): boolean {
        if (this.games[key].time - Date.now() > 24 * 60 * 60 * 1000) {
            delete this.games[key];
            return true;
        } 
        return false;
    }
    public removeOld() {
        for (let key in this.games) {
            if (this.games[key].time - Date.now() > 24 * 60 * 60 * 1000) {
                delete this.games[key];
            }
        }
    }

    public createGame(gameId: string): void {
        this.games[gameId] = new Game();
    }

    public gameExists(gameId: string): boolean {
        return this.games[gameId] !== undefined;
    }

    /**
     * assumes correctness of gameId and data.player
     * but NOT the rest of data
     * @param gameId
     * @param data
     */
    public update(gameId: string, player: number, data: any): void {
        this.games[gameId].update(player, data);
    }

    /**
     * assumes correctness of gameId and player
     * @param gameId
     * @param player 
     */
    public getData(gameId: string, player: number) {
        return this.games[gameId].data(player);
    }



}