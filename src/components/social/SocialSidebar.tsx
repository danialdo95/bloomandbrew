import { TrendTags } from "@/components/TrendTags";

const calendarEvents: Record<number, {
  title: string;
  type: string;
  time: string;
  detail: string;
}> = {
  2: {
    title: "Latte art class",
    type: "Cafe",
    time: "10:00 AM",
    detail: "Share a pour, cafe corner, or flower pairing for the community feed.",
  },
  4: {
    title: "Bouquet drop",
    type: "Floral",
    time: "2:30 PM",
    detail: "Collect seasonal arrangement ideas for creator posts.",
  },
  6: {
    title: "Weekend cafe crawl",
    type: "Social",
    time: "9:00 AM",
    detail: "Save ideas for the next cafe and bouquet inspiration run.",
  },
};

type SocialSidebarProps = {
  trends: Array<{ label: string; count: number }>;
  source: "reddit" | "fallback";
};

export function SocialSidebar({ trends, source }: SocialSidebarProps) {
  const today = new Date();
  const calendarDays = getCurrentWeek(today);
  const monthLabel = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const nextEvents = calendarDays.filter((item) => item.event);

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
              aria-label={`${item.fullLabel}${item.event ? `, ${item.event.title} at ${item.event.time}` : ""}`}
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
              {nextEvents.length} events
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {nextEvents.map((item) => (
              <div
                key={`${item.isoDate}-${item.event?.title}`}
                className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#211f1d]">
                      {item.event?.title}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#8a7d73]">
                      {item.shortDate} · {item.event?.time}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#c45572]">
                    {item.event?.type}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-[#6f6259]">
                  {item.event?.detail}
                </p>
              </div>
            ))}
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
    </aside>
  );
}

function getCurrentWeek(today: Date) {
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
      event: calendarEvents[index] ?? null,
      isToday: isSameDate(date, today),
    };
  });
}

function isSameDate(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}
