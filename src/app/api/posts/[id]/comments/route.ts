import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: postId } = await context.params;
  const body = (await request.json()) as {
    text?: unknown;
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

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorName: user.name,
      authorUsername: user.username,
      authorAvatar: user.avatar,
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
