import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ people: [] });
  }

  const people = await prisma.user.findMany({
    where: {
      id: {
        not: user.id,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
    include: {
      followers: {
        where: {
          followerId: user.id,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return NextResponse.json({
    people: people.map((person) => ({
      id: person.id,
      name: person.name,
      username: person.username,
      avatar: person.avatar,
      bio: person.bio ?? "Bloom & Brew member.",
      isFollowing: person.followers.length > 0,
    })),
  });
}
