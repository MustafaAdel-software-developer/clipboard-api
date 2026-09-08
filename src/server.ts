import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { readBody, readJson, sendJson } from "./http.js";
import { createRouter } from "./router.js";
import { createLinkService } from "./services/links.js";
import { createMemoryStore } from "./storage/memory.js";

export function startServer(port: number) {
  const store = createMemoryStore();
  const links = createLinkService(store);
  const router = createRouter(links);
  const server = createServer((req, res) => {
    router(req, res).catch((err: unknown) => {
      console.error(err);
      sendJson(res, 500, { ok: false, error: "Internal error" });
    });
  });

  server.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });
  return server;
}
