import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: postId } = await context.params;
  const userIdentifier = user.id;

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

  await prisma.postShare.upsert({
    where: {
      postId_userIdentifier: {
        postId,
        userIdentifier,
      },
    },
    update: {},
    create: {
      postId,
      userIdentifier,
    },
  });

  const shares = await prisma.postShare.count({
    where: {
      postId,
    },
  });

  return NextResponse.json({ shares });
}
