import {IncomingMessage , ServerResponse} from 'node:http';

const MAX_BODY_BYTES = 1_000_000; //1MB


export function sendJson(res:ServerResponse,status:number,body:unknown):void{
    const json = JSON.stringify(body);
    res.writeHead(status,{
        "content-type":"application/json; charset=utf-8",
        "content-length": Buffer.byteLength(json)
    });
    res.end(json);
}

export class PayloadTooLargeError extends Error {
    constructor(){
        super("Payload too large.");
        this.name = "PayloadTooLargeError";
    }
}

export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new PayloadTooLargeError());
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => Buffer.concat(chunks).toString("utf-8"));
    req.on("error", reject);
  });
}

export async function readJson(req: IncomingMessage): Promise<unknown>{
    
    const body = readBody(req);
    if(!body) return {};
    return JSON.stringify(body) as unknown;
} 