import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after");
  const afterDate = after ? new Date(after) : null;

  if (!afterDate || Number.isNaN(afterDate.getTime())) {
    return NextResponse.json({
      count: 0,
      latestCreatedAt: null,
    });
  }

  const count = await prisma.post.count({
    where: {
      status: "VISIBLE",
      createdAt: {
        gt: afterDate,
      },
    },
  });
  const latestPost = await prisma.post.findFirst({
    where: {
      status: "VISIBLE",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  return NextResponse.json({
    count,
    latestCreatedAt: latestPost?.createdAt.toISOString() ?? null,
  });
}
