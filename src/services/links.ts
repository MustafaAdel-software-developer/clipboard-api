import { randomBytes } from "node:crypto";
import { CreateLinkInput, Link, Result } from "../types.js";
import type { LinkStore } from "../storage/types.js";

function generateCode(size = 6): string {
  return randomBytes(size).toString("base64url").slice(0, size);
}

export function createLinkService(store: LinkStore) {
  return {
    async create(input: CreateLinkInput): Promise<Result<Link>> {
      const code = input.code ?? generateCode();
      if (input.code) {
        const exist = await store.getByCode(input.code);
        if (exist) return { ok: false, error: "code is taken" };
      }
      const link: Link = {
        code,
        url: input.url,
        createdAt: new Date().toISOString(),
        clicks: 0,
      };
      await store.save(link);
      return { ok: true, data: link };
    },

    async find(code: string): Promise<Result<Link>> {
      const link = await store.getByCode(code);
      if (!link) return { ok: false, error: "code not found" };

      return { ok: true, data: link };
    },
    async registerClick(code: string): Promise<Result<Link>> {
      const updated = await store.incrementClicks(code);
      if (!updated) return { ok: false, error: "not found" };
      return { ok: true, data: updated };
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
