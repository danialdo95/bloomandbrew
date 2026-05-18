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

  const existingSave = await prisma.savedPost.findUnique({
    where: {
      postId_userIdentifier: {
        postId,
        userIdentifier,
      },
    },
  });

  const bookmarked = !existingSave;

  if (existingSave) {
    await prisma.savedPost.delete({
      where: {
        id: existingSave.id,
      },
    });
  } else {
    await prisma.savedPost.create({
      data: {
        postId,
        userIdentifier,
      },
    });
  }

  return NextResponse.json({
    bookmarked,
  });
}
