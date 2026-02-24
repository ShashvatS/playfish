import { Game } from "./game";
import { NUM_PLAYERS, COOKIE_NAME } from "./types";
import type { Env, Move, ServerMessage, RoomState } from "./types";

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const eqIdx = c.indexOf("=");
      if (eqIdx === -1) return [c.trim(), ""];
      return [c.slice(0, eqIdx).trim(), c.slice(eqIdx + 1).trim()];
    })
  );
}

export class GameRoom implements DurableObject {
  private game: Game | null = null;
  private names: string[] = Array.from(
    { length: NUM_PLAYERS },
    (_, i) => `Player ${i + 1}`
  );
  // Which cookie holds each player slot (null = slot open)
  private playerCookies: (string | null)[] = Array(NUM_PLAYERS).fill(null);
  // Spectators: cookie → player number they are watching
  private spectators: Map<string, number> = new Map();
  private gameCode = "";

  constructor(
    private readonly ctx: DurableObjectState,
    private readonly env: Env
  ) {
    this.ctx.blockConcurrencyWhile(async () => {
      await this.loadFromStorage();
    });
  }

  private async loadFromStorage(): Promise<void> {
    const stored = await this.ctx.storage.get<RoomState>("roomState");
    if (!stored) return;
    this.game = new Game(stored.gameData);
    this.names = stored.names;
    this.playerCookies = stored.playerCookies;
    this.gameCode = stored.gameCode;
    for (const [cookie, playerNum] of Object.entries(stored.spectators)) {
      this.spectators.set(cookie, playerNum);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (!this.game) return;
    const state: RoomState = {
      gameData: this.game.serialize(),
      names: this.names,
      playerCookies: this.playerCookies,
      spectators: Object.fromEntries(this.spectators),
      gameCode: this.gameCode,
      createdAt: this.game.createdAt,
    };
    await this.ctx.storage.put("roomState", state);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/create") {
      return this.handleCreate(url.searchParams.get("gameId") ?? "");
    }
    if (url.pathname === "/exists") {
      return Response.json({ exists: this.game !== null });
    }
    if (url.pathname === "/ws") {
      return this.handleWebSocketUpgrade(request);
    }

    return new Response("Not Found", { status: 404 });
  }

  private handleCreate(gameId: string): Response {
    if (this.game !== null) {
      return Response.json({ error: "Game already exists" }, { status: 409 });
    }
    this.game = new Game();
    this.gameCode = gameId;
    this.ctx.blockConcurrencyWhile(() => this.saveToStorage());
    return Response.json({ success: true });
  }

  private handleWebSocketUpgrade(request: Request): Response {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const cookies = parseCookies(request.headers.get("Cookie"));
    const clientId = cookies[COOKIE_NAME];
    if (!clientId) {
      return new Response("Missing client ID cookie", { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server, [clientId]);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer
  ): Promise<void> {
    const tags = this.ctx.getTags(ws);
    const clientId = tags[0];

    let parsed: Record<string, unknown>;
    try {
      const raw =
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message);
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      this.send(ws, { event: "error", message: "Invalid JSON" });
      return;
    }

    const { event } = parsed;

    switch (event) {
      case "join":
        await this.handleJoin(ws, clientId, parsed);
        break;
      case "watch":
        await this.handleWatch(ws, clientId, parsed);
        break;
      case "makemove":
        await this.handleMakeMove(ws, clientId, parsed);
        break;
      case "gamestate":
        this.handleGameStateRequest(ws, clientId);
        break;
      case "localMessage":
        this.handleLocalMessage(ws, clientId, parsed);
        break;
      case "declarealert":
        this.handleDeclareAlert(ws, clientId);
        break;
      case "leave":
        await this.handleLeave(ws, clientId);
        break;
      default:
        this.send(ws, { event: "error", message: `Unknown event: ${String(event)}` });
    }
  }

  async webSocketClose(
    _ws: WebSocket,
    _code: number,
    _reason: string
  ): Promise<void> {
    // Connections close naturally; clients reconnect by joining again
  }

  async webSocketError(_ws: WebSocket, _error: unknown): Promise<void> {
    // Errors are handled gracefully; client can reconnect
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private send(ws: WebSocket, message: ServerMessage): void {
    ws.send(JSON.stringify(message));
  }

  private sendToClient(clientId: string, message: ServerMessage): void {
    for (const ws of this.ctx.getWebSockets(clientId)) {
      ws.send(JSON.stringify(message));
    }
  }

  /** Broadcast a message to all connected players (not spectators). */
  private broadcastToPlayers(message: ServerMessage): void {
    for (const cookie of this.playerCookies) {
      if (cookie) this.sendToClient(cookie, message);
    }
  }

  /** Broadcast a message to every WebSocket in this Durable Object (players + spectators). */
  private broadcastToAll(message: ServerMessage): void {
    for (const ws of this.ctx.getWebSockets()) {
      ws.send(JSON.stringify(message));
    }
  }

  /** Push current game state to every player and spectator. */
  private broadcastGameState(): void {
    if (!this.game) return;

    // Each player sees only their own cards
    for (let i = 0; i < NUM_PLAYERS; i++) {
      const cookie = this.playerCookies[i];
      if (!cookie) continue;
      const msg: ServerMessage = {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(i),
        player: i,
        names: this.names,
      };
      this.sendToClient(cookie, msg);
    }

    // Spectators see the game from the perspective of the player they're watching
    for (const [specCookie, watchingPlayer] of this.spectators) {
      const msg: ServerMessage = {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(watchingPlayer),
        player: watchingPlayer,
        names: this.names,
      };
      this.sendToClient(specCookie, msg);
    }
  }

  private getPlayerForCookie(clientId: string): number | null {
    const idx = this.playerCookies.indexOf(clientId);
    return idx >= 0 ? idx : null;
  }

  private removeClientFromGame(clientId: string): boolean {
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum !== null) {
      this.playerCookies[playerNum] = null;
      return true;
    }
    if (this.spectators.delete(clientId)) return true;
    return false;
  }

  // ─── Event Handlers ───────────────────────────────────────────────────────

  private async handleJoin(
    ws: WebSocket,
    clientId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.game) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }

    const playerNum = Number(data.player);
    if (isNaN(playerNum) || playerNum < 0 || playerNum >= NUM_PLAYERS) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }

    if (this.playerCookies.includes(clientId)) {
      this.send(ws, { event: "joinstatus", success: false, reason: "you already joined" });
      return;
    }

    if (this.playerCookies[playerNum] !== null) {
      this.send(ws, { event: "joinstatus", success: false, reason: "someone else already joined" });
      return;
    }

    const currentCount = this.playerCookies.filter((c) => c !== null).length;
    if (currentCount >= NUM_PLAYERS) {
      this.send(ws, { event: "joinstatus", success: false, reason: "already 6 players" });
      return;
    }

    let playerName = String(data.name ?? "").trim();
    if (!playerName || playerName === `Player ${playerNum + 1}`) {
      playerName = `Playah #${playerNum + 1}`;
    }

    for (let i = 0; i < NUM_PLAYERS; i++) {
      if (i !== playerNum && this.names[i] === playerName) {
        this.send(ws, { event: "joinstatus", success: false, reason: "duplicate name" });
        return;
      }
    }

    // Remove from spectators if applicable, then join as player
    this.spectators.delete(clientId);
    this.playerCookies[playerNum] = clientId;
    this.names[playerNum] = playerName;
    await this.saveToStorage();

    this.send(ws, { event: "joinstatus", success: true });
    this.broadcastToPlayers({ event: "refresh" });
  }

  private async handleWatch(
    ws: WebSocket,
    clientId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.game) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }

    const playerNum = Number(data.player);
    if (isNaN(playerNum) || playerNum < 0 || playerNum >= NUM_PLAYERS) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }

    if (this.playerCookies[playerNum] === null) {
      this.send(ws, { event: "joinstatus", success: false, reason: "player hasnt joined yet" });
      return;
    }

    this.removeClientFromGame(clientId);
    this.spectators.set(clientId, playerNum);

    this.send(ws, { event: "joinstatus", success: true });

    // Send spectator the current game state from watched player's perspective
    this.send(ws, {
      event: "gamestate",
      gameCode: this.gameCode,
      data: this.game.getData(playerNum),
      player: playerNum,
      names: this.names,
    });

    // Notify the watched player that someone is spectating
    const watchedCookie = this.playerCookies[playerNum]!;
    const spectatorName = String(data.name ?? "").trim() || undefined;
    this.sendToClient(watchedCookie, {
      event: "spectatorjoinedgame",
      name: spectatorName,
    });
  }

  private async handleMakeMove(
    ws: WebSocket,
    clientId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.game) {
      this.send(ws, { event: "makemovestatus", success: false });
      return;
    }

    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum === null) {
      this.send(ws, { event: "makemovestatus", success: false });
      return;
    }

    this.game.update(playerNum, data.data as Move);
    await this.saveToStorage();

    this.send(ws, { event: "makemovestatus", success: true });
    this.broadcastGameState();
  }

  private handleGameStateRequest(ws: WebSocket, clientId: string): void {
    if (!this.game) return;

    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum !== null) {
      this.send(ws, {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(playerNum),
        player: playerNum,
        names: this.names,
      });
      return;
    }

    const watchingPlayer = this.spectators.get(clientId);
    if (watchingPlayer !== undefined) {
      this.send(ws, {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(watchingPlayer),
        player: watchingPlayer,
        names: this.names,
      });
    }
  }

  private handleLocalMessage(
    _ws: WebSocket,
    clientId: string,
    data: Record<string, unknown>
  ): void {
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum === null) return;

    const message = String(data.message ?? "");
    const name = this.names[playerNum];

    // Broadcast chat to all players and spectators
    this.broadcastToAll({ event: "localmessage", user: name, message });
  }

  private handleDeclareAlert(_ws: WebSocket, clientId: string): void {
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum === null) return;

    const name = this.names[playerNum];
    // Notify all players and spectators
    this.broadcastToAll({ event: "declarealert", name });
  }

  private async handleLeave(ws: WebSocket, clientId: string): Promise<void> {
    const removed = this.removeClientFromGame(clientId);
    if (removed) {
      await this.saveToStorage();
      this.send(ws, { event: "leavestatus", success: true, reason: "left game" });
    } else {
      this.send(ws, { event: "leavestatus", success: true, reason: "nothing to leave" });
    }
  }
}
