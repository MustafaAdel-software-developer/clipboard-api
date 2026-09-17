import { isLink, isLinkArray } from "../src/storage/guards";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const valid = {
  code: "d0s1",
  url: "https://example.com",
  createdAt: "2026-09-13T10:00:00.000Z",
  clicks: 0,
};

describe("isLink", () => {
  it("accept a valid link", () => {
    assert.equal(isLink(valid), true);
  });

  it("rejects null value", () => {
    assert.equal(isLink(null), false);
  });

  it("rejects non-string input in code", () => {
    assert.equal(isLink({ ...valid, code: 0 }), false);
  });
});

describe("isLinkArray", () => {
  it("accept array of link", () => {
    assert.equal(isLinkArray([valid]), true);
  });

  it("rejects when one element is bad", () => {
    assert.equal(isLinkArray([valid, { ...valid, code: 1 }]), false);
  });
});
