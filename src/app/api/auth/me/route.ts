import { NextResponse } from "next/server";

import {
  DISABLED_ACCOUNT_MESSAGE,
  getCurrentUser,
  getCurrentUserResult,
  getUserFollowStats,
  isAdminUser,
  toAuthUser,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SocialProfile } from "@/types/social";

function normalizeUsername(value: string) {
  return value.replace(/[^a-z0-9_]/gi, "").toLowerCase();
}

export async function GET() {
  const { disabled, user } = await getCurrentUserResult();

  if (!user) {
    return NextResponse.json(
      {
        disabledAccount: disabled,
        error: disabled ? DISABLED_ACCOUNT_MESSAGE : undefined,
        user: null,
      },
      { status: disabled ? 403 : 200 },
    );
  }

  const stats = await getUserFollowStats(user.id);

  return NextResponse.json({
    user: {
      ...toAuthUser(user),
      isAdmin: isAdminUser(user),
      stats,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SocialProfile>;
  const name = typeof body.name === "string" && body.name.trim()
    ? body.name.trim()
    : user.name;
  const username = typeof body.username === "string" && body.username.trim()
    ? normalizeUsername(body.username)
    : user.username;
  const avatar = typeof body.avatar === "string" && body.avatar.trim()
    ? body.avatar.trim().slice(0, 4)
    : user.avatar;
  const bio = typeof body.bio === "string" ? body.bio : user.bio;
  const location = typeof body.location === "string" ? body.location : user.location;

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        username,
        avatar,
        bio,
        location,
      },
    });

    const stats = await getUserFollowStats(updatedUser.id);

    return NextResponse.json({
      user: {
        ...toAuthUser(updatedUser),
        isAdmin: isAdminUser(updatedUser),
        stats,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Username is already taken." },
      { status: 409 },
    );
  }
}
