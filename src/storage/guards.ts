import { Link } from "../types.js";

export function isLink(value: unknown): value is Link {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const v = value as Record<string, unknown>;
  if (typeof v.code !== "string") return false;
  if (typeof v.url !== "string") return false;
  if (typeof v.createdAt !== "string") return false;
  if (typeof v.clicks !== "number" || !Number.isFinite(v.clicks)) return false;

  return true;
}
export function isLinkArray(value: unknown): value is Link[] {
    return Array.isArray(value) && value.every(isLink);
}
