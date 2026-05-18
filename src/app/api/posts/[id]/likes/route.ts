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
    profile?: Partial<SocialProfile>;
  };

  const profile = body.profile ?? {};
  const userIdentifier = normalizeUsername(
    typeof profile.username === "string" ? profile.username : "bloombarista",
  );

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

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userIdentifier: {
        postId,
        userIdentifier,
      },
    },
  });

  const liked = !existingLike;

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
  } else {
    await prisma.like.create({
      data: {
        postId,
        userIdentifier,
      },
    });
  }

  const likes = await prisma.like.count({
    where: {
      postId,
    },
  });

  return NextResponse.json({
    liked,
    likes,
  });
}
