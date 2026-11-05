import { readBodyLimited } from "@/src/server/chat-limits";
import { createSessionToken, getPassword, passwordMatches, sessionCookie } from "@/src/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!getPassword()) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }

  const raw = await readBodyLimited(request, 1024);
  if (raw === null) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  let password: unknown;
  try {
    password = JSON.parse(raw)?.password;
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(token) } });
}
