import { NextResponse } from "next/server";

import { upsertExternalPost, type ExternalPostPayload } from "@/lib/external-posts";
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

  const { id } = await context.params;
  const body = (await request.json()) as {
    post?: ExternalPostPayload;
    text?: unknown;
  };
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!body.post || body.post.id !== id) {
    return NextResponse.json({ error: "External post payload is required." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json(
      { error: "Comment text is required." },
      { status: 400 },
    );
  }

  await upsertExternalPost(body.post);

  const comment = await prisma.externalComment.create({
    data: {
      externalPostId: id,
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
