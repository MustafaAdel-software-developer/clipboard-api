import { IncomingMessage, ServerResponse } from "node:http";
import { LinkService } from "../services/links.js";
import {  readJson, sendJson } from "../http.js";
import { parseCreateLinkBody } from "../validation.js";
import { ListQuery } from "../types.js";
import { BadRequestError, NotFoundError, PayloadTooLargeError } from "../errors.js";

export function createLinksRoutes(links: LinkService) {
  return {
    async create(req: IncomingMessage, res: ServerResponse) {
      let body: unknown;
      try {
        body = await readJson(req);
      } catch (err) {
        if (err instanceof PayloadTooLargeError) throw err;
        throw new BadRequestError("Invalid JSON");
      }
      const parsed = parseCreateLinkBody(body);
      if (!parsed.ok) {
        sendJson(res, 400, parsed);
        return;
      }

      const result = await links.create(parsed.data);
      if (!result.ok) {
        sendJson(res, 409, result);
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
    async list(
      req: IncomingMessage,
      res: ServerResponse,
      parsedLimit: ListQuery,
    ) {
      const list = await links.list(parsedLimit.limit);
      if (!list.ok) {
        sendJson(res, 404, list);
        return;
      }
      sendJson(res, 200, { ok: true, data: list.data });
      return;
    },
    async stats(_req: IncomingMessage, res: ServerResponse, code: string) {
      const result = await links.find(code);
      if (!result.ok) {
        throw new NotFoundError(result.error);
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
