"use client";

import { useEffect, useMemo, useState } from "react";

import { TrendTags } from "@/components/TrendTags";
import type { PublicCalendarEvent } from "@/lib/calendar";

type SocialSidebarProps = {
  trends: Array<{ label: string; count: number }>;
  source: "reddit" | "fallback";
  onUseCalendarPostIdea?: (postIdea: string) => void;
};

export function SocialSidebar({
  trends,
  source,
  onUseCalendarPostIdea,
}: SocialSidebarProps) {
  const [events, setEvents] = useState<PublicCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PublicCalendarEvent | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const today = new Date();
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const calendarDays = getCurrentWeek(today, eventsByDate);
  const monthLabel = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const nextEvents = calendarDays.filter((item) => item.event);

  useEffect(() => {
    let isMounted = true;

    async function loadCalendarEvents() {
      try {
        const response = await fetch("/api/calendar", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json() as { events?: PublicCalendarEvent[] };

        if (isMounted) {
          setEvents(data.events ?? []);
        }
      } finally {
        if (isMounted) {
          setIsLoadingEvents(false);
        }
      }
    }

    void loadCalendarEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="order-3 space-y-5 lg:order-none">
      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c45572]">
              Bloom calendar
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#211f1d]">{monthLabel}</h2>
          </div>
          <span className="rounded-full bg-[#fff176] px-3 py-1 text-xs font-black text-[#211f1d]">
            This week
          </span>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5" role="list" aria-label="This week's content calendar">
          {calendarDays.map((item) => (
            <div
              key={item.isoDate}
              role="listitem"
              aria-label={`${item.fullLabel}${item.event ? `, ${item.event.title} at ${formatEventTime(item.event.startsAt)}` : ""}`}
              className={`relative min-h-16 rounded-[6px] border px-1.5 py-2 text-center transition ${
                item.isToday
                  ? "border-[#211f1d] bg-[#fff176] shadow-[0_8px_18px_rgba(33,31,29,0.14)]"
                  : item.event
                    ? "border-[#c45572] bg-[#fff8f2]"
                    : "border-[#eadfd4] bg-white"
              }`}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#8a7d73]">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-black leading-none text-[#211f1d]">{item.day}</p>
              {item.event ? (
                <span
                  className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${
                    item.isToday ? "bg-[#211f1d]" : "bg-[#c45572]"
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[#f2e8df] pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-[#211f1d]">Up next</h3>
            <span className="rounded-full bg-[#fff8f2] px-2.5 py-1 text-[11px] font-black text-[#8a7d73]">
              {isLoadingEvents ? "Syncing" : `${nextEvents.length} events`}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {nextEvents.map((item) => (
              <button
                type="button"
                key={`${item.isoDate}-${item.event?.title}`}
                onClick={() => {
                  setSelectedEvent(item.event ?? null);
                }}
                className="w-full rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] p-3 text-left transition hover:border-[#c45572] hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#211f1d]">
                      {item.event?.title}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#8a7d73]">
                      {item.shortDate} · {item.event ? formatEventTime(item.event.startsAt) : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#c45572]">
                    {formatEventType(item.event?.eventType)}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-[#6f6259]">
                  {item.event?.description ?? item.event?.prompt}
                </p>
              </button>
            ))}
            {!nextEvents.length && !isLoadingEvents ? (
              <p className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] p-3 text-xs font-bold leading-5 text-[#6f6259]">
                No public post ideas scheduled for this week.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <h2 className="font-black text-[#211f1d]">Trending now</h2>
        <div className="mt-4">
          <TrendTags trends={trends} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#8a7d73]">
          Source: {source === "reddit" ? "Live Reddit feed" : "Curated community feed"}
        </p>
      </section>

      {selectedEvent ? (
        <CalendarEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUsePostIdea={onUseCalendarPostIdea}
        />
      ) : null}
    </aside>
  );
}

function CalendarEventModal({
  event,
  onClose,
  onUsePostIdea,
}: {
  event: PublicCalendarEvent;
  onClose: () => void;
  onUsePostIdea?: (postIdea: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-event-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_24px_70px_rgba(33,31,29,0.28)]">
        <div className="border-b border-[#f2e8df] bg-[#fffaf6] px-5 py-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
            {formatEventType(event.eventType)} event
          </p>
          <h2 id="calendar-event-title" className="mt-2 text-2xl font-black text-[#211f1d]">
            {event.title}
          </h2>
          <p className="mt-2 text-sm font-bold text-[#8a7d73]">
            {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          {event.description ? (
            <p className="text-sm font-bold leading-6 text-[#6f6259]">
              {event.description}
            </p>
          ) : null}
          {event.prompt ? (
            <div className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#c45572]">
                Post idea
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#211f1d]">
                {event.prompt}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#f2e8df] bg-[#fffaf6] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#eadfd4] bg-white px-4 py-2 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
          >
            Close
          </button>
          {event.prompt && onUsePostIdea ? (
            <button
              type="button"
              onClick={() => {
                onUsePostIdea(event.prompt ?? "");
                onClose();
              }}
              className="rounded-[6px] bg-[#211f1d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#c45572]"
            >
              Use as post idea
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getCurrentWeek(
  today: Date,
  eventsByDate: Map<string, PublicCalendarEvent[]>,
) {
  const startOfWeek = new Date(today);
  const dayOffset = (today.getDay() + 6) % 7;
  startOfWeek.setDate(today.getDate() - dayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);

    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      day: date.toLocaleDateString("en-US", { day: "numeric" }),
      fullLabel: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      shortDate: date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      }),
      isoDate: date.toISOString(),
      event: eventsByDate.get(getDateKey(date))?.[0] ?? null,
      isToday: isSameDate(date, today),
    };
  });
}

function groupEventsByDate(events: PublicCalendarEvent[]) {
  const grouped = new Map<string, PublicCalendarEvent[]>();

  for (const event of events) {
    const key = getDateKey(new Date(event.startsAt));
    grouped.set(key, [...(grouped.get(key) ?? []), event]);
  }

  return grouped;
}

function getDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatEventType(value?: string) {
  if (!value) {
    return "Content";
  }

  return value.charAt(0) + value.slice(1).toLowerCase();
}

function isSameDate(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}
