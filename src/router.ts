import { IncomingMessage, ServerResponse } from "node:http";
import { LinkService } from "./services/links.js";
import { createLinksRoutes } from "./routes/links.js";
import { sendJson } from "./http.js";
import { healthRoute } from "./routes/health.js";
import { parseCode } from "./validation.js";

type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export function createRouter(links: LinkService): Handler {
  const linkRoutes = createLinksRoutes(links);

  return async (req, res) => {
    const method = req.method ?? "GET";
    const host = req.headers.host ?? "localhost";
    const url = new URL(req.url ?? "/", `http://${host}`);
    const path = url.pathname;
    if (method === "GET" && path === "/health") {
      await healthRoute(req, res);
      return;
    }
    if (method === "POST" && path === "/links") {
      await linkRoutes.create(req, res);
      return;
    }
    if (method === "GET" && path.startsWith("/links/")) {
      const parsed = parseCode(path.slice("/links/".length));
      if (!parsed.ok) {
        sendJson(res, 404, { ok: false, error: "Not found" });
        return;
      }
      await linkRoutes.stats(req, res, parsed.data);
      return;
    }
    if (method === "GET" && path === "/links") {
      const limit = Number(url.searchParams.get("limit") ?? 0);
      console.log(limit)
      await linkRoutes.list(req, res, limit);
      return;
    }
    if (method === "DELETE" && path.startsWith("/links/")) {
      const parsed = parseCode(path.slice("/links/".length));
      if (!parsed.ok) {
        sendJson(res, 404, { ok: false, error: "Not found" });
        return;
      }
      await linkRoutes.delete(req, res, parsed.data);
      return;
    }
    if (method === "GET" && path.length > 1 && !path.slice(1).includes("/")) {
      await linkRoutes.redirect(req, res, path.slice(1));
      return;
    }
    sendJson(res, 404, { ok: false, error: "Not found" });
  };
}
