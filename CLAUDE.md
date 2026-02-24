# Playfish

A real-time multiplayer card game — Canadian Fish (also called Literature) — for exactly 6 players split into two teams.

## Tech Stack

- **Runtime**: Cloudflare Workers (TypeScript, ESNext, bundled by Wrangler/esbuild)
- **State**: Cloudflare Durable Objects (one DO per game room, hibernatable WebSockets)
- **Frontend**: Vanilla JS + jQuery + Material Design Lite, served as static assets via Workers Assets
- **Real-time**: Native WebSocket (replaced Socket.io)

## Development

```bash
npm install
npx wrangler dev        # local dev server with DO support
```

The local dev server proxies Durable Objects and simulates the Workers environment.

## Deployment

```bash
# First time only — set the reCAPTCHA secret:
npx wrangler secret put RECAPTCHA_SECRET

npx wrangler deploy
```

After deploying to a new domain, update the reCAPTCHA site key in `public/index.html` (the `data-sitekey` attribute on the `.g-recaptcha` div) via the Google reCAPTCHA console.

## Key Files

### Backend (`src/`)
| File | Purpose |
|------|---------|
| `src/index.ts` | Worker entry point — routes `POST /create` and `GET /ws` |
| `src/game-room.ts` | Durable Object — owns one game's WebSocket connections and state |
| `src/game.ts` | Pure game logic (no I/O); serializable for DO storage |
| `src/types.ts` | All shared TypeScript interfaces and constants |

### Frontend (`public/`)
| File | Purpose |
|------|---------|
| `public/index.html` | Main SPA; contains the `GameSocket` WebSocket wrapper class and client-ID cookie generation |
| `public/scripts/app.js` | Gameplay UI (card display, ask/declare/transfer actions) |
| `public/scripts/join.js` | Join, watch, and leave game flows |
| `public/scripts/host.js` | Game creation form (posts to `/create`) |
| `public/scripts/localchat.js` | In-game chat |

Old backend files (`app.ts`, `logic.ts`, `game.ts` at root, `routes/`, `views/`) are the original Express/Socket.io code — kept for reference but not used.

## Architecture

```
Browser
  └─ GameSocket (native WebSocket wrapper, defined in index.html)
       └─ /ws?game=GAMECODE  ──►  Worker (src/index.ts)
                                       └─ GameRoom DO (src/game-room.ts)
                                             ├─ Game logic (src/game.ts)
                                             └─ DO storage (persists game state)

Browser
  └─ fetch POST /create  ──►  Worker
                                └─ GameRoom DO (creates new game + stores in DO storage)
```

**Routing**: Cloudflare Assets serves everything in `public/` statically. The Worker only runs for `/create` and `/ws` (no static file matches those paths).

**Game rooms**: Each game is identified by a 10-character alphanumeric code. `env.GAME_ROOM.idFromName(code)` deterministically maps the code to a DO instance. A location hint derived from `request.cf.continent` is passed to `.get()` so the DO is created near the game's host.

**Client identity**: A `clientid` cookie is generated client-side (in `index.html`) on first visit using `crypto.getRandomValues`. It is sent with every WebSocket upgrade request and used to tag WebSocket connections inside the DO.

**WebSocket protocol**: Every message is a JSON object with an `event` field. The `GameSocket` class in `index.html` exposes `socket.on(event, handler)` and `socket.emit(event, jsonString)` so the existing game scripts needed minimal changes from the Socket.io version.

## Environment Variables

| Variable | How to set | Purpose |
|----------|-----------|---------|
| `RECAPTCHA_SECRET` | `wrangler secret put RECAPTCHA_SECRET` | Server-side reCAPTCHA v2 verification key |
| `DISABLE_CAPTCHA` | `wrangler.toml` → `[vars]` | Set to `"true"` to skip CAPTCHA (testing); set to `"false"` or remove for production |

## Game Rules (implemented in `src/game.ts`)

- **54 cards**, **9 sets** of 6 cards each
- **6 players**: even team (0, 2, 4) vs odd team (1, 3, 5); player 0 always goes first
- **Ask**: on your turn, ask an opponent for a specific card — you must hold a card in that set. Correct → you keep the turn; wrong → turn passes to the opponent
- **Declare**: claim all 6 cards of a set are distributed among your team exactly as specified. Correct → your team scores 1 point; wrong → the other team scores 1 point. Either way the set is removed from play
- **Transfer**: pass your turn to a teammate (allowed even if you still hold cards)
- Game ends when all 9 sets are declared (max 9 points total)

## Durable Object Storage Schema

The DO persists a single `roomState` key containing:
```typescript
{
  gameData: SerializedGame,   // full game state
  names: string[],            // player display names (indexed 0–5)
  playerCookies: (string | null)[],  // cookie per player slot
  spectators: Record<string, number>, // cookie → player being watched
  gameCode: string,
  createdAt: number,
}
```
