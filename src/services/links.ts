import { randomBytes } from "node:crypto";
import { CreateLinkInput, Link, Result } from "../types.js";
import type { LinkStore } from "../storage/types.js";

function generateCode(size = 6): string {
  return randomBytes(size).toString("base64url").slice(0, size);
}

function isValidURL(url: string): boolean {
  const u = new URL(url);
  return u.protocol === "http:" || u.protocol === "https:";
}

export function createLinkService(store: LinkStore) {
  return {
    async create(input: CreateLinkInput): Promise<Result<Link>> {
      if (!isValidURL(input.url)) return { ok: false, error: "url invalid!" };
      if (input.url.length > 2048) {
        return { ok: false, error: "URL too long" };
      }
      const code = generateCode();
      const link: Link = {
        code,
        url: input.url,
        createdAt: new Date().toISOString(),
        clicks: 0,
      };
      store.save(link);
      return { ok: true, data: link };
    },

    async find(code: string): Promise<Result<Link>> {
      const link = await store.getByCode(code);
      if (!link) return { ok: false, error: "code not found" };

      return { ok: true, data: link };
    },

    async registerClick(code: string): Promise<Result<Link>> {
      const found = await this.find(code);
      if (!found.ok) return found;

      found.data.clicks += 1;
      return found;
    },
    async delete(code: string): Promise<Result<Link>> {
      const found = await this.find(code);
      if (!found.ok) {
        return { ok: false, error: "code doesn't match any" };
      }
      await store.delete(code);
      return found;
    },
    async list(limit: number): Promise<Result<Link[]>> {
      const list = await store.list();
      return { ok: true, data: limit ? list.slice(0, limit) : list };
    },
  };
}

export type LinkService = ReturnType<typeof createLinkService>;
