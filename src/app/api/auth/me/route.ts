import { NextResponse } from "next/server";

import { getCurrentUser, toAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SocialProfile } from "@/types/social";

function normalizeUsername(value: string) {
  return value.replace(/[^a-z0-9_]/gi, "").toLowerCase();
}

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json({
    user: user ? toAuthUser(user) : null,
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

    return NextResponse.json({ user: toAuthUser(updatedUser) });
  } catch {
    return NextResponse.json(
      { error: "Username is already taken." },
      { status: 409 },
    );
  }
}
