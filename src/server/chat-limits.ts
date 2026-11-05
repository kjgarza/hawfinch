import { z } from "zod";

export const MAX_BODY_BYTES = 256 * 1024;
export const MAX_MESSAGES = 40;
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_STEPS = 3;
export const MAX_OUTPUT_TOKENS = 1024;

const messageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(MAX_MESSAGE_CHARS),
  })
  .passthrough();

export const chatBodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
});

/**
 * Read a request body as text, aborting once more than `maxBytes` bytes have
 * arrived. Returns null when the limit is exceeded. Counts bytes, not
 * characters, and does not rely on Content-Length.
 */
export async function readBodyLimited(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
