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
