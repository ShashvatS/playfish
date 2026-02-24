import { GameRoom } from "./game-room";
import { COOKIE_NAME, GAME_CODE_LENGTH } from "./types";
import type { Env } from "./types";

// Re-export the Durable Object class so Cloudflare can find it
export { GameRoom };

function randomString(length: number): string {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

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

async function handleCreate(
  request: Request,
  env: Env
): Promise<Response> {
  const contentType = request.headers.get("Content-Type") ?? "";
  let captchaToken: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string>;
    captchaToken = body["g-recaptcha-response"] ?? null;
  } else {
    // Handle application/x-www-form-urlencoded (jQuery form submit)
    const formData = await request.formData();
    captchaToken = formData.get("g-recaptcha-response") as string | null;
  }

  if (!captchaToken) {
    return Response.json({ pass: false, reason: "no recaptcha" });
  }

  // Verify reCAPTCHA with Google
  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${env.RECAPTCHA_SECRET}&response=${captchaToken}&remoteip=${ip}`;

  let captchaOk = false;
  try {
    const verifyResponse = await fetch(verifyUrl);
    const verifyData = (await verifyResponse.json()) as { success: boolean };
    captchaOk = verifyData.success === true;
  } catch {
    return Response.json({ pass: false, reason: "recaptcha verification failed" });
  }

  if (!captchaOk) {
    return Response.json({ pass: false, reason: "recaptcha failed" });
  }

  // Create a new game room via Durable Object
  const gameId = randomString(GAME_CODE_LENGTH);
  const id = env.GAME_ROOM.idFromName(gameId);
  const room = env.GAME_ROOM.get(id);

  const createResponse = await room.fetch(
    new Request(`https://internal/create?gameId=${gameId}`, { method: "GET" })
  );

  if (!createResponse.ok) {
    return Response.json({ pass: false, reason: "failed to create game" });
  }

  return Response.json({ pass: true, code: gameId });
}

async function handleWebSocket(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const gameCode = url.searchParams.get("game");

  if (!gameCode) {
    return new Response("Missing game code", { status: 400 });
  }

  // Make sure the client has a clientid cookie before upgrading to WebSocket
  const cookies = parseCookies(request.headers.get("Cookie"));
  if (!cookies[COOKIE_NAME]) {
    return new Response("Missing client ID cookie", { status: 400 });
  }

  // Route WebSocket upgrade to the appropriate Durable Object
  const id = env.GAME_ROOM.idFromName(gameCode);
  const room = env.GAME_ROOM.get(id);

  // Forward the full request (including Cookie header) to the DO
  return room.fetch(
    new Request(`https://internal/ws`, {
      headers: request.headers,
    })
  );
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Game creation
    if (url.pathname === "/create" && request.method === "POST") {
      return handleCreate(request, env);
    }

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      return handleWebSocket(request, env);
    }

    // All other routes: let Cloudflare Assets handle static files
    // (configured via [assets] in wrangler.toml)
    return new Response("Not Found", { status: 404 });
  },
};
