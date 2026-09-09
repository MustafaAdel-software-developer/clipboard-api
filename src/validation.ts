import { z } from "zod";
import { CreateLinkInput, Result } from "./types.js";

const MAX_URL_LENGTH = 2048;
const CODE_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const CreateLinkSchema = z.object({
  url: z.string().trim().min(1).max(2048).url(),
});

export function parseCreateLinkBody(body: unknown): Result<CreateLinkInput> {
  const result = CreateLinkSchema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Invalid Body",
    };
  }
  return { ok: true, data: result.data };
}
