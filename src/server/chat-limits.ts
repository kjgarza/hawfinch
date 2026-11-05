import { z } from "zod";

export const MAX_BODY_BYTES = 256 * 1024;
export const MAX_MESSAGES = 40;
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_STEPS = 3;
export const MAX_OUTPUT_TOKENS = 1024;

const messageSchema = z
  .object({
    role: z.enum(["user", "assistant", "system", "data"]),
    content: z.string().max(MAX_MESSAGE_CHARS),
  })
  .passthrough();

export const chatBodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
});
