import { NextResponse } from "next/server";

import { getPublicCalendarEvents, toPublicCalendarEvent } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getPublicCalendarEvents({
    from: startOfToday(),
    take: 20,
  });

  return NextResponse.json({
    events: events.map(toPublicCalendarEvent),
  });
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
