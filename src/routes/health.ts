import { IncomingMessage, ServerResponse } from "node:http";
import { sendJson } from "../http.js";

export async function healthRoute(
  _req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  sendJson(res, 200, { ok: true });
}
