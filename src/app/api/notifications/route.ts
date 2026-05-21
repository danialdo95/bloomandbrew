import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toNotificationItem(notification: {
  id: string;
  text: string;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    text: notification.text,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return NextResponse.json({
    notifications: notifications.map(toNotificationItem),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    text?: unknown;
  };
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json(
      { error: "Notification text is required." },
      { status: 400 },
    );
  }

  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      text,
    },
  });

  return NextResponse.json(
    {
      notification: toNotificationItem(notification),
    },
    { status: 201 },
  );
}
