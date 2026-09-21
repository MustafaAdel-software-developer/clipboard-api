import { DatabaseSync } from "node:sqlite";
import { LinkStore } from "./types.js";
import { Link } from "../types.js";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// what we need to create
/*
CREATE TABLE IF NOT EXIST links (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0
);
*/

export async function createSqliteStore(dbPath: string): Promise<LinkStore> {
    await mkdir(dirname(dbPath), { recursive: true });
    const db = new DatabaseSync(dbPath);
    db.exec(`CREATE TABLE IF NOT EXISTS links (
        code TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        clicks INTEGER NOT NULL DEFAULT 0);`);

    const insert = db.prepare(`INSERT INTO links (code,url,createdAt,clicks) VALUES(?,?,?,?)`) 
    const update = db.prepare(`UPDATE links SET code = ?, url = ?, createdAt = ?, clicks = ?`)
    const select = db.prepare(`SELECT * FROM links WHERE code = ?`)
    const remove = db.prepare(`DELETE FROM links WHERE code = ?`)
    const selectAll = db.prepare(`SELECT * FROM links`);

    return {
        async save(link){
            insert.run(link.code,link.url,link.createdAt,link.clicks);
        },
        async update(link){
            update.run(link.code,link.url,link.createdAt,link.clicks);
        },
        async getByCode(code){
            const row = select.get(code) as Link | undefined;
            return row ?? null;
        },
        async delete(code) {
            remove.run(code);
        },
        async list(){
            return selectAll.all() as Link[];
        }
    }
}
