import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { streamText } = vi.hoisted(() => ({
  streamText: vi.fn(() => ({
    toDataStreamResponse: () => new Response("streamed", { status: 200 }),
  })),
}));
vi.mock("ai", () => ({ streamText }));
vi.mock("@ai-sdk/openai", () => ({ openai: () => "mock-model" }));

import { POST as chat } from "@/app/(preview)/api/chat/route";
import { POST as login } from "@/app/(preview)/api/auth/login/route";
import { COOKIE_NAME, createSessionToken, verifySessionToken } from "@/src/server/auth";

const PASSWORD = "test-password-not-real";
const body = JSON.stringify({ messages: [{ role: "user", content: "hello" }] });

function chatRequest(init: { cookie?: string; body?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (init.cookie) headers.cookie = init.cookie;
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers,
    body: init.body ?? body,
  });
}

beforeEach(() => {
  process.env.HAWFINCH_PASSWORD = PASSWORD;
  streamText.mockClear();
});
afterEach(() => {
  delete process.env.HAWFINCH_PASSWORD;
});

describe("/api/chat auth", () => {
  it("returns 401 without a cookie and never calls OpenAI", async () => {
    const res = await chat(chatRequest());
    expect(res.status).toBe(401);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns 401 with a bad cookie", async () => {
    for (const bad of ["garbage", "9999999999.AAAA", "1.sig"]) {
      const res = await chat(chatRequest({ cookie: `${COOKIE_NAME}=${bad}` }));
      expect(res.status).toBe(401);
    }
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns 401 for an expired token", async () => {
    const old = createSessionToken(Date.now() - 1000 * 60 * 60 * 24 * 30)!;
    expect(verifySessionToken(old)).toBe(false);
    const res = await chat(chatRequest({ cookie: `${COOKIE_NAME}=${old}` }));
    expect(res.status).toBe(401);
  });

  it("does not read the body when unauthenticated", async () => {
    const req = chatRequest();
    const spy = vi.spyOn(req, "text");
    const json = vi.spyOn(req, "json");
    await chat(req);
    expect(spy).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  it("fails closed when the secret is unset, even with a previously valid cookie", async () => {
    const token = createSessionToken()!;
    delete process.env.HAWFINCH_PASSWORD;
    const res = await chat(chatRequest({ cookie: `${COOKIE_NAME}=${token}` }));
    expect(res.status).toBe(401);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("rejects a token signed under a different password", async () => {
    const token = createSessionToken()!;
    process.env.HAWFINCH_PASSWORD = "rotated-password";
    const res = await chat(chatRequest({ cookie: `${COOKIE_NAME}=${token}` }));
    expect(res.status).toBe(401);
  });

  it("passes auth with a valid cookie and calls the mocked model with capped steps", async () => {
    const token = createSessionToken()!;
    const res = await chat(chatRequest({ cookie: `other=1; ${COOKIE_NAME}=${token}` }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("streamed");
    expect(streamText).toHaveBeenCalledTimes(1);
    const args = (streamText.mock.calls[0] as unknown as [{ maxSteps: number }])[0];
    expect(args.maxSteps).toBeLessThanOrEqual(3);
  });

  it("enforces message count and length limits for authenticated callers", async () => {
    const cookie = `${COOKIE_NAME}=${createSessionToken()!}`;
    const many = JSON.stringify({
      messages: Array.from({ length: 41 }, () => ({ role: "user", content: "x" })),
    });
    expect((await chat(chatRequest({ cookie, body: many }))).status).toBe(400);
    const long = JSON.stringify({ messages: [{ role: "user", content: "x".repeat(4001) }] });
    expect((await chat(chatRequest({ cookie, body: long }))).status).toBe(400);
    expect((await chat(chatRequest({ cookie, body: "not json" }))).status).toBe(400);
    const sys = JSON.stringify({ messages: [{ role: "system", content: "x" }] });
    expect((await chat(chatRequest({ cookie, body: sys }))).status).toBe(400);
    expect(streamText).not.toHaveBeenCalled();
  });
});

describe("/api/chat body size", () => {
  it("counts bytes, not characters", async () => {
    const cookie = `${COOKIE_NAME}=${createSessionToken()!}`;
    // 100k three-byte characters is 300 KB, but only 100k UTF-16 code units.
    const big = JSON.stringify({ messages: [{ role: "user", content: "€".repeat(100_000) }], pad: "" });
    expect((await chat(chatRequest({ cookie, body: big }))).status).toBe(413);
    expect(streamText).not.toHaveBeenCalled();
  });
});

describe("/api/auth/login", () => {
  const loginRequest = (password: unknown) =>
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

  it("sets an httpOnly cookie for the right password", async () => {
    const res = await login(loginRequest(PASSWORD));
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${COOKIE_NAME}=`);
    expect(cookie).toContain("HttpOnly");
  });

  it("returns 401 for the wrong password and sets no cookie", async () => {
    const res = await login(loginRequest("demo123"));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("fails closed when the secret is unset", async () => {
    delete process.env.HAWFINCH_PASSWORD;
    const res = await login(loginRequest(""));
    expect(res.status).toBe(503);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
