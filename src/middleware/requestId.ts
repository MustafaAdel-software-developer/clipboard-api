import { randomUUID } from "node:crypto";
import { IncomingMessage } from "node:http";

export function getRequestd(req: IncomingMessage): string {
    const raw = req.headers["x-request-id"];

    const fromClient = Array.isArray(raw) ? raw[0] : raw;
    if(fromClient && fromClient.trim() !== ""){
        return fromClient.trim();
    }
    return randomUUID();
}