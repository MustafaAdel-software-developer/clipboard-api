import { randomBytes } from "node:crypto";
import { CreateLinkInput, Link, Result } from "../types.js";

/* create link -> validate on http URL -> generateCode.
// find link
// register click */

//in-memory storage
const links = new Map<string,Link>(); 

function generateCode(size = 6): string {
  return randomBytes(size).toString("base64url").slice(0, size);
}

function isValidURL(url:string): boolean {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
}

export function createLink(input: CreateLinkInput): Result<Link> {
  if (!isValidURL(input.url)) return { ok: false, error: "url invalid!" };
  if (input.url.length > 2048) {
    return { ok: false, error: "URL too long" };
  }
  const code = generateCode();
  const link: Link = {
    code,
    url: input.url,
    createdAt: new Date().toISOString(),
    clicks: 0,
  };
  links.set(code, link);
  return { ok: true, data: link };
}

export function findLink(code: string): Result<Link>{
    const found = links.get(code);
    if(!found) return { ok: false, error: "code not found"};

    return {ok: true, data: found};
}

export function registerClick(code: string): Result<Link> {
    const link = findLink(code);
    if(!link.ok) return link;
    
    link.data.clicks += 1;
    return link;
}
