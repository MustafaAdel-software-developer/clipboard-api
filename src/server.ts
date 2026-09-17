import {
  createServer,
} from "node:http";
import { readBody, readJson, sendJson } from "./http.js";
import { createRouter } from "./router.js";
import { createLinkService } from "./services/links.js";
import { createMemoryStore } from "./storage/memory.js";
import { createFileStore } from "./storage/file.js";
import { AppError } from "./errors.js";
import { getRequestd } from "./middleware/requestId.js";

export async function startServer(port: number) {
  const store =
    process.env.STORE === "file"
      ? await createFileStore(process.env.DATA_PATH ?? "data/links.json")
      : createMemoryStore();
  const links = createLinkService(store);
  const router = createRouter(links);
  const server = createServer((req, res) => {
    const requestId = getRequestd(req);
    res.setHeader("x-request-id", requestId);

    const start = Date.now();

    router(req, res)
      .catch((err: unknown) => {
        const { status, body } = toErrorResponse(err);
        sendJson(res, status, body);
      })
      .finally(() => {
        const ms = Date.now() - start;
        const method = req.method ?? "?";
        const path = req.url ?? "?";
        const status = res.statusCode;
        console.log(`${method} ${path} ${status} ${ms}ms rid=${requestId}`);
      });
  });

  server.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });
  return server;

  function toErrorResponse(err: unknown): { status: number; body: object } {
    if (err instanceof AppError) {
      return {
        status: err.status,
        body: { ok: false, error: err.message, code: err.code},
      };
    }
    console.error(err);
    return { status: 500, body: { ok: false, error: "Internal error" } };
  }
}
