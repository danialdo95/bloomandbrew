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

  const { id: followingId } = await context.params;

  if (followingId === user.id) {
    return NextResponse.json(
      { error: "You cannot follow yourself." },
      { status: 400 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: followingId,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId,
      },
    },
  });

  const isFollowing = !existingFollow;

  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });
  } else {
    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId,
      },
    });
  }

  return NextResponse.json({
    isFollowing,
    username: targetUser.username,
  });
}
