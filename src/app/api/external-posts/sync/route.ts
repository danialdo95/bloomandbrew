import { NextResponse } from "next/server";

import {
  getExternalPostStats,
  isExternalSource,
  upsertExternalPost,
  type ExternalPostPayload,
} from "@/lib/external-posts";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = (await request.json()) as {
    posts?: unknown;
  };

  const posts = Array.isArray(body.posts) ? body.posts : [];
  const externalPosts = posts.filter((post): post is ExternalPostPayload => {
    if (!post || typeof post !== "object") {
      return false;
    }

    const candidate = post as Partial<ExternalPostPayload>;

    return Boolean(
      typeof candidate.id === "string" &&
        isExternalSource(candidate.source) &&
        typeof candidate.content === "string" &&
        typeof candidate.author === "string" &&
        typeof candidate.community === "string" &&
        typeof candidate.createdAt === "string",
    );
  });

  const entries = await Promise.all(
    externalPosts.map(async (post) => {
      await upsertExternalPost(post);
      const stats = await getExternalPostStats(post.id, user?.id);
      return [post.id, stats] as const;
    }),
  );

  return NextResponse.json({
    posts: Object.fromEntries(entries),
  });
}
