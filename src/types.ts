export const NUM_CARDS = 54;
export const NUM_SETS = 9;
export const CARDS_PER_SET = 6;
export const NUM_PLAYERS = 6;
export const COOKIE_NAME = "clientid";
export const GAME_CODE_LENGTH = 10;

// Game move types
export interface AskMove {
  type: "ask";
  card: number;
  other: number;
}

export interface DeclareMove {
  type: "declare";
  set: number;
  // "0" through "5" → player number for each card in the set
  0?: number;
  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
}

export interface TransferMove {
  type: "transfer";
  other: number;
}

export type Move = AskMove | DeclareMove | TransferMove;

export interface LastDeclare {
  player: number;
  set: number;
  success: boolean;
}

// Game data returned to a specific player
export interface GameData {
  cards: number[];
  lastMove: number[] | null;
  scoreOdd: number;
  scoreEven: number;
  turn: number;
  numCards: number[];
  declares: number[];
  declaresLog: number[];
  lastDeclare: LastDeclare;
}

// WebSocket messages: Client → Server
export type ClientMessage =
  | { event: "join"; game: string; player: number; name: string }
  | { event: "watch"; game: string; player: number; name?: string }
  | { event: "makemove"; data: Move }
  | { event: "gamestate" }
  | { event: "localMessage"; message: string }
  | { event: "declarealert" }
  | { event: "leave" };

// WebSocket messages: Server → Client
export type ServerMessage =
  | { event: "joinstatus"; success: true }
  | { event: "joinstatus"; success: false; reason: string }
  | { event: "gamestate"; gameCode: string; data: GameData; player: number; names: string[] }
  | { event: "refresh" }
  | { event: "declarealert"; name: string }
  | { event: "localmessage"; user: string; message: string }
  | { event: "spectatorjoinedgame"; name?: string }
  | { event: "leavestatus"; success: boolean; reason: string }
  | { event: "makemovestatus"; success: boolean }
  | { event: "error"; message: string };

// Durable Object state persisted to storage
export interface RoomState {
  gameData: SerializedGame;
  names: string[];
  playerCookies: (string | null)[];
  spectators: Record<string, number>;
  gameCode: string;
  createdAt: number;
}

export interface SerializedGame {
  cards: number[];
  numCards: number[];
  numCardsBySet: number[][];
  declares: number[];
  declaresLog: number[];
  moves: number[][];
  scoreOdd: number;
  scoreEven: number;
  lastPlayer: number;
  lastDeclarePlayer: number;
  lastDeclareWasCorrect: boolean;
  lastDeclareSet: number;
  createdAt: number;
}

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  RECAPTCHA_SECRET: string;
  DISABLE_CAPTCHA?: string; // set to "true" in wrangler.toml to skip verification
}
