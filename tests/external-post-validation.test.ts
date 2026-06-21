import assert from "node:assert/strict";
import test from "node:test";

import { isValidExternalPostPayload } from "../src/lib/external-post-validation";

const validPost = {
  id: "youtube-123",
  source: "youtube",
  content: "Latte art",
  author: "Bloom",
  community: "YouTube",
  imageUrl: null,
  createdAt: "2026-06-21T09:30:00.000Z",
};

test("accepts a bounded external post payload", () => {
  assert.equal(isValidExternalPostPayload(validPost), true);
});

test("rejects malformed external post payloads", () => {
  assert.equal(isValidExternalPostPayload({ ...validPost, createdAt: "invalid" }), false);
  assert.equal(isValidExternalPostPayload({ ...validPost, source: "bloom" }), false);
  assert.equal(isValidExternalPostPayload({ ...validPost, content: "x".repeat(2_001) }), false);
  assert.equal(isValidExternalPostPayload({ ...validPost, id: "" }), false);
});
