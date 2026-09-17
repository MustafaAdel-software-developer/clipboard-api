import { describe, it } from "node:test";
import { parseListQuery } from "../src/validation";
import assert from "node:assert/strict";

describe("parseListQuery", () => {
  it("defaults to 10", () => {
    const r = parseListQuery(new URLSearchParams(""));
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.data.limit, 10);
  });
});
