import type { Link } from "../types.js";
import type { LinkStore } from "./types.js";

export function createMemoryStore() : LinkStore {
  const links = new Map<string, Link>();

  return {
    async save(link) {
      links.set(link.code, link);
    },
    async getByCode(code) {
      return links.get(code) ?? null;
    },
    async incrementClicks(code) {
      const link = links.get(code);
      if (!link) return null;
      const updated = { ...link, clicks: link.clicks + 1 };
      links.set(code, updated);
      return updated;
    },
    async update(link) {
      links.set(link.code, link);
    },
    async delete(code) {
      links.delete(code);
    },
    async list() {
      return [...links.values()];
    },
  };
}
