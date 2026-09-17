import { dirname } from "node:path";
import { Link } from "../types.js";
import { isLinkArray } from "./guards.js";
import { LinkStore } from "./types.js";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";

export async function createFileStore(filePath: string): Promise<LinkStore> {
  const links = new Map<string, Link>();

  async function ensureLoaded(): Promise<void> {
    let text: string;
    try {
      text = await readFile(filePath, "utf8");
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return; // empty Map
      }
      throw err;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch (err) {
      throw new Error(`corrupt ${filePath}: invalid JSON`);
    }

    if (!isLinkArray(raw)) {
      throw new Error(`corrupt ${filePath}: expected Link[]`);
    }
    for (const link of raw) {
      links.set(link.code, link);
    }
  }

  await ensureLoaded();

  async function flush(): Promise<void> {
    try {
      const fileTempPath = `${filePath}.tmp`;
      await mkdir(dirname(fileTempPath), { recursive: true });
      const text = JSON.stringify([...links.values()], null, 2);
      await writeFile(fileTempPath, text, "utf8");
      await rename(fileTempPath, filePath);
    } catch (err) {
      throw err;
    }
  }

  let chain = Promise.resolve();
  function withLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = chain.then(fn, fn);
    chain = run.then(
      () => {},
      () => {},
    );
    return run;
  }

  return {
    async getByCode(code) {
      return links.get(code) ?? null;
    },
    async list() {
      return [...links.values()];
    },
    async save(link) {
      return withLock(async () => {
        links.set(link.code, link);
        await flush();
      });
    },
    async update(link) {
      return withLock(async () => {
        links.set(link.code, link);
        await flush();
      });
    },
    async delete(code) {
      return withLock(async () => {
        links.delete(code);
        await flush();
      });
    },
  };
}
