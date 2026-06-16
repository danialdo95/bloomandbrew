import { prisma } from "@/lib/prisma";

export const CALENDAR_EVENT_TYPES = ["CAFE", "FLORAL", "SOCIAL", "PROMOTION", "CONTENT"] as const;
export const CALENDAR_EVENT_STATUSES = ["DRAFT", "SCHEDULED", "COMPLETED", "CANCELLED"] as const;
export const CALENDAR_EVENT_VISIBILITIES = ["PUBLIC", "ADMIN"] as const;

export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];
export type CalendarEventStatus = (typeof CALENDAR_EVENT_STATUSES)[number];
export type CalendarEventVisibility = (typeof CALENDAR_EVENT_VISIBILITIES)[number];

export type PublicCalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  eventType: string;
  status: string;
  visibility: string;
  startsAt: string;
  endsAt: string | null;
};

export function isCalendarEventType(value: string): value is CalendarEventType {
  return CALENDAR_EVENT_TYPES.includes(value as CalendarEventType);
}

export function isCalendarEventStatus(value: string): value is CalendarEventStatus {
  return CALENDAR_EVENT_STATUSES.includes(value as CalendarEventStatus);
}

export function isCalendarEventVisibility(value: string): value is CalendarEventVisibility {
  return CALENDAR_EVENT_VISIBILITIES.includes(value as CalendarEventVisibility);
}

export function toPublicCalendarEvent(event: {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  eventType: string;
  status: string;
  visibility: string;
  startsAt: Date;
  endsAt: Date | null;
}): PublicCalendarEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    prompt: event.prompt,
    eventType: event.eventType,
    status: event.status,
    visibility: event.visibility,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
  };
}

export async function getPublicCalendarEvents({
  from = new Date(),
  take = 12,
}: {
  from?: Date;
  take?: number;
} = {}) {
  return prisma.calendarEvent.findMany({
    where: {
      startsAt: {
        gte: from,
      },
      status: "SCHEDULED",
      visibility: "PUBLIC",
    },
    orderBy: {
      startsAt: "asc",
    },
    take,
  });
}
