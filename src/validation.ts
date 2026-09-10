import { z } from "zod";
import { CreateLinkInput, ListQuery, Result } from "./types.js";

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
export function parseCode(raw: string): Result<string> {
  if (!CODE_PATTERN.test(raw)) {
    return { ok: false, error: "Invalid code." };
  }
  return { ok: true, data: raw };
}

export function parseListQuery(params: URLSearchParams): Result<ListQuery> {
  const raw = params.get("limit");
  if (!raw) return { ok: true, data: { limit: 10 } };

  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 100)
    return { ok: false, error: "limit should be in range 1 to 100" };

  return { ok: true, data: { limit: n } };
}
