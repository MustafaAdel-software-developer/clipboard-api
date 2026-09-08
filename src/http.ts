import {IncomingMessage , ServerResponse} from 'node:http';

// send Json - read Json - read Body

export function sendJson(res:ServerResponse,status:number,body:unknown):void{
    const json = JSON.stringify(body);
    res.writeHead(status,{
        "content-type":"application/json; charset=utf-8",
        "content-length": Buffer.byteLength(json)
    });
    res.end(json);
}

export function readBody(req:IncomingMessage): Promise<string>{
    return new Promise((resolve,reject) => {
        const chunks:Buffer[] = [];
        req.on("data",(chunk:Buffer) => chunks.push(chunk));
        req.on("end",() => Buffer.concat(chunks).toString("utf-8"));
        req.on("error",reject);
    });
}

export async function readJson(req: IncomingMessage): Promise<unknown>{

    const body = readBody(req);
    if(!body) return {};
    return JSON.stringify(body) as unknown;
} 