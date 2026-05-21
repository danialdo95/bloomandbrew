import { NextResponse } from "next/server";

import {
  getExternalPostStats,
  upsertExternalPost,
  type ExternalPostPayload,
} from "@/lib/external-posts";
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
  };

  if (!body.post || body.post.id !== id) {
    return NextResponse.json({ error: "External post payload is required." }, { status: 400 });
  }

  await upsertExternalPost(body.post);

  const existingSave = await prisma.externalSavedPost.findUnique({
    where: {
      externalPostId_userIdentifier: {
        externalPostId: id,
        userIdentifier: user.id,
      },
    },
  });
  const bookmarked = !existingSave;

  if (existingSave) {
    await prisma.externalSavedPost.delete({
      where: {
        id: existingSave.id,
      },
    });
  } else {
    await prisma.externalSavedPost.create({
      data: {
        externalPostId: id,
        userIdentifier: user.id,
      },
    });
  }

  const stats = await getExternalPostStats(id, user.id);

  return NextResponse.json({
    ...stats,
    bookmarked,
  });
}
