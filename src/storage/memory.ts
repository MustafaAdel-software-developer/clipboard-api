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
    async update(link) {
      links.set(link.code, link);
    },
    async delete(code) {
      links.delete(code);
    },
    async list() {
       return [...links.values()];
    }
  };
}
