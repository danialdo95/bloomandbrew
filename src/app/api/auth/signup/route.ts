import { NextResponse } from "next/server";

import {
  createSession,
  createUniqueUsername,
  hashPassword,
  toAuthUser,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Name, valid email, and a password of at least 6 characters are required." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      username: await createUniqueUsername(email),
      passwordHash: hashPassword(password),
      avatar: getInitials(name) || "BB",
      bio: "New to Bloom & Brew Social.",
      location: "Kuala Lumpur",
    },
  });

  await createSession(user.id);

  return NextResponse.json({
    user: {
      ...toAuthUser(user),
      stats: {
        followers: 0,
        following: 0,
      },
    },
  }, { status: 201 });
}
