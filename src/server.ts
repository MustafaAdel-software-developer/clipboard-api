import {createServer, type IncomingMessage, type ServerResponse} from "node:http"; // why here choose to write type than before !
import { readBody, readJson, sendJson } from "./http.js";
import { createLink, findLink, registerClick } from "./services/links.js";


// handler - start server.

async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const method = req.method ?? "GET";
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const path = url.pathname;
  let c:string;

  if (method === "GET" && path === "/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === "POST" && path === "/links") {
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

    const result = createLink({ url: urlValue });
    if (!result.ok) {
      sendJson(res, 400, result);
      return;
    }

    sendJson(res, 201, { ok: true, data: result });
    return;
  }

  // GET /:code  (single segment, not /health or /links)
  if (method === "GET" && path.length > 1 && !path.slice(1).includes("/")) {
    const code = path.slice(1);
    const result = registerClick(code);
    if (!result.ok) {
      sendJson(res, 404, result);
      return;
    }
    res.writeHead(302, { Location: result.data.url });
    res.end();
    return;
  }
  sendJson(res, 404, { ok: false, error: "Not found" });

    // GET /links/:code
  if (method === "GET" && path.startsWith("/links/")) {
    const code = path.slice("/links/".length);
    
    if(!code || code.includes('/')){
      sendJson(res,404,{error: "code not found"});
      return;
    }

    const result = findLink(code);
    if(!result.ok){
      sendJson(res,404,{error: "no link found!"});
      return;
    }
    
    sendJson(res, 200, {
      ok: true,
      data: {
        code,
        url: result.data.url,
        clicks: result.data.clicks,
        createdAt: result.data.createdAt,
      },
    });
    return;
  }

}

export function startServer(port:number){
    const server = createServer((req,res) => {
        handler(req,res).catch((err: unknown) => {
            console.error(err);
            sendJson(res,500,{ok: false, error:"Internal error"})
        });
    });

    server.listen(port, () => {
      console.log(`listening on http://localhost:${port}`);
    });
};