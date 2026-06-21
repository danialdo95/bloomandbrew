import { NextResponse } from "next/server";

import {
  getExternalPostStatsBatch,
  insertExternalPosts,
  type ExternalPostPayload,
} from "@/lib/external-posts";
import { getCurrentUser } from "@/lib/auth";
import { isValidExternalPostPayload } from "@/lib/external-post-validation";

const MAX_POSTS = 30;
const MAX_BODY_BYTES = 64 * 1024;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const requestsByClient = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const current = requestsByClient.get(client);

  if (!current || current.resetAt <= now) {
    requestsByClient.set(client, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: "Too many sync requests." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Sync payload is too large." }, { status: 413 });
  }

  const user = await getCurrentUser();
  let body: { posts?: unknown };

  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Sync payload is too large." }, { status: 413 });
    }
    body = JSON.parse(rawBody) as { posts?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const posts = Array.isArray(body.posts) ? body.posts : [];
  if (posts.length > MAX_POSTS || !posts.every(isValidExternalPostPayload)) {
    return NextResponse.json({ error: "Invalid or excessive external posts." }, { status: 400 });
  }

  const externalPosts = posts as ExternalPostPayload[];
  await insertExternalPosts(externalPosts);
  const stats = await getExternalPostStatsBatch(
    externalPosts.map((post) => post.id),
    user?.id,
  );

  return NextResponse.json({
    posts: stats,
  });
}
