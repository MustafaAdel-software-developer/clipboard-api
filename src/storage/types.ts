import { Link } from "../types.js";

export interface LinkStore {
  save(link: Link): Promise<void>;
  getByCode(code: string): Promise<Link | null>;
  update(link: Link): Promise<void>;
  delete(code: string):Promise<void>;
}