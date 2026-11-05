import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "hawfinch_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/**
 * Server-only shared password. Never prefix with NEXT_PUBLIC_.
 * Returns null when unset or blank, which makes every auth check fail closed.
 */
export function getPassword(): string | null {
  const value = process.env.HAWFINCH_PASSWORD;
  return value && value.trim().length > 0 ? value : null;
}

function signingKey(password: string): Buffer {
  // Derived from the password, so rotating the password invalidates all sessions.
  return createHmac("sha256", "hawfinch-session-key-v1").update(password).digest();
}

function sign(payload: string, password: string): string {
  return createHmac("sha256", signingKey(password)).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordMatches(candidate: unknown): boolean {
  const password = getPassword();
  if (!password || typeof candidate !== "string") return false;
  return safeEqual(candidate, password);
}

export function createSessionToken(now: number = Date.now()): string | null {
  const password = getPassword();
  if (!password) return null;
  const expires = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expires);
  return `${payload}.${sign(payload, password)}`;
}

export function verifySessionToken(token: string | undefined, now: number = Date.now()): boolean {
  const password = getPassword();
  if (!password || !token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^\d{1,12}$/.test(payload)) return false;
  if (!safeEqual(signature, sign(payload, password))) return false;
  return Number(payload) > Math.floor(now / 1000);
}

export function readCookie(request: Request, name: string = COOKIE_NAME): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return undefined;
}

export function isAuthenticated(request: Request): boolean {
  return verifySessionToken(readCookie(request));
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearedCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
