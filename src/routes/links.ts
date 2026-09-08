import { IncomingMessage, ServerResponse } from "node:http";
import { LinkService } from "../services/links.js";
import { readJson, sendJson } from "../http.js";

export function createLinksRoutes(links: LinkService) {
  return {
    async create(req: IncomingMessage, res: ServerResponse) {
      let body: unknown;
      try {
        body = await readJson(req);
      } catch {
        sendJson(res, 400, { ok: false, error: "Invalid JSON" });
        return;
      }

      const urlValue =
        typeof body === "object" &&
        body !== null &&
        "url" in body &&
        typeof (body as { url: unknown }).url === "string"
          ? (body as { url: string }).url
          : null;

      if (!urlValue) {
        sendJson(res, 400, { ok: false, error: "Missing url string" });
        return;
      }

      const result = await links.create({ url: urlValue });
      if (!result.ok) {
        sendJson(res, 400, result);
        return;
      }

      sendJson(res, 201, { ok: true, data: result });
      return;
    },
    async delete(req: IncomingMessage, res: ServerResponse, code: string) {
       const result = await links.delete(code);
      if (!result.ok) {
        sendJson(res, 404, result);
        return;
      }
      sendJson(res, 200, { ok: true, data: result.data });
    },
    async list(req:IncomingMessage, res: ServerResponse, limit: number) {
      const list = await links.list(limit);
      if(!list.ok){
        sendJson(res, 404, list);
        return;
      }
      sendJson(res, 200, { ok: true, data: list.data });
      return;
    },
    async stats(_req: IncomingMessage, res: ServerResponse, code: string) {
      const result = await links.find(code);
      if (!result.ok) {
        sendJson(res, 404, result);
        return;
      }
      sendJson(res, 200, { ok: true, data: result.data });
    },
    async redirect(_req: IncomingMessage, res: ServerResponse, code: string) {
      const result = await links.registerClick(code);
      if (!result.ok) {
        sendJson(res, 404, result);
        return;
      }
      res.writeHead(302, { Location: result.data.url });
      res.end();
    },
  };
}
