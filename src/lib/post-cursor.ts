export type PostCursor = {
  createdAt: string;
  id: string;
};

export function decodePostCursor(value: string | null): PostCursor | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<PostCursor>;
    const createdAt = typeof parsed.createdAt === "string" ? new Date(parsed.createdAt) : null;

    if (!createdAt || Number.isNaN(createdAt.getTime()) || typeof parsed.id !== "string" || !parsed.id) {
      return null;
    }

    return { createdAt: createdAt.toISOString(), id: parsed.id };
  } catch {
    return null;
  }
}

export function encodePostCursor(post: { createdAt: Date; id: string }) {
  return Buffer.from(JSON.stringify({
    createdAt: post.createdAt.toISOString(),
    id: post.id,
  })).toString("base64url");
}
