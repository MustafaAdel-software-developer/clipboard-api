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

export function parseCreateLinkBody(body: unknown): Result<CreateLinkInput> {
  if (!isRecord(body)) {
    return { ok: false, error: "Boyd must be a JSON object." };
  }

  const { url } = body;

  if (typeof url !== "string") {
    return { ok: false, error: "field url must be string." };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: "field url must not be empty." };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      error: `url size must be at most ${MAX_URL_LENGTH} characters.`,
    };
  }

  if (!isHttpUrl(trimmed)) {
    return { ok: false, error: "url field must be http(s) URL." };
  }
  return { ok: true, data: { url: trimmed } };
}

export function parseCode(raw: string): Result<string> {
  if (!CODE_PATTERN.test(raw)) {
    return { ok: false, error: "Invalid code." };
  }
  return { ok: true, data: raw };
}

