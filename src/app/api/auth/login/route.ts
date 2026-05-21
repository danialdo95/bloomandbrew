import { NextResponse } from "next/server";

import { createSession, toAuthUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: unknown;
    password?: unknown;
  };

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user.id);

  const [followers, following] = await Promise.all([
    prisma.follow.count({
      where: {
        followingId: user.id,
      },
    }),
    prisma.follow.count({
      where: {
        followerId: user.id,
      },
    }),
  ]);

  return NextResponse.json({
    user: {
      ...toAuthUser(user),
      stats: {
        followers,
        following,
      },
    },
  });
}
