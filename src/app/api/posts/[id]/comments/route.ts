import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import type { SocialProfile } from "@/types/social";

function normalizeUsername(value: string) {
  return value.replace(/[^a-z0-9_]/gi, "").toLowerCase() || "bloombarista";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await context.params;
  const body = (await request.json()) as {
    text?: unknown;
    profile?: Partial<SocialProfile>;
  };

  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json(
      { error: "Comment text is required." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const profile = body.profile ?? {};
  const authorName = typeof profile.name === "string" && profile.name.trim()
    ? profile.name.trim()
    : "Bloom Barista";
  const authorUsername = normalizeUsername(
    typeof profile.username === "string" ? profile.username : "bloombarista",
  );
  const authorAvatar = typeof profile.avatar === "string" && profile.avatar.trim()
    ? profile.avatar.trim().slice(0, 4)
    : "BB";

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorName,
      authorUsername,
      authorAvatar,
      text,
    },
  });

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        author: comment.authorName,
        text: comment.text,
      },
    },
    { status: 201 },
  );
}
