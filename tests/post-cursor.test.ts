import assert from "node:assert/strict";
import test from "node:test";

import { decodePostCursor, encodePostCursor } from "../src/lib/post-cursor";

test("post cursors preserve the timestamp and deterministic tie-breaker", () => {
  const post = { createdAt: new Date("2026-06-21T09:30:00.000Z"), id: "post_123" };
  assert.deepEqual(decodePostCursor(encodePostCursor(post)), {
    createdAt: post.createdAt.toISOString(),
    id: post.id,
  });
});

test("invalid post cursors are rejected", () => {
  assert.equal(decodePostCursor(null), null);
  assert.equal(decodePostCursor("not-base64-json"), null);
  assert.equal(
    decodePostCursor(Buffer.from(JSON.stringify({ createdAt: "bad", id: "post_123" })).toString("base64url")),
    null,
  );
  assert.equal(
    decodePostCursor(Buffer.from(JSON.stringify({ createdAt: "2026-06-21T09:30:00Z", id: "" })).toString("base64url")),
    null,
  );
});
