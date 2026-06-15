import { TrendTags } from "@/components/TrendTags";

const calendarEvents: Record<number, string> = {
  2: "Latte art",
  4: "Bouquet drop",
  6: "Cafe crawl",
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

        <div className="mt-5 grid grid-cols-7 gap-2">
          {calendarDays.map((item) => (
            <div
              key={item.isoDate}
              className={`min-h-20 rounded-[6px] border px-2 py-2 text-center ${
                item.isToday
                  ? "border-[#211f1d] bg-[#fff176]"
                  : item.event
                  ? "border-[#c45572] bg-[#fff8f2]"
                  : "border-[#eadfd4] bg-white"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8a7d73]">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-black text-[#211f1d]">{item.day}</p>
              {item.event ? (
                <p className={`mt-1 text-[10px] font-black leading-4 ${
                  item.isToday ? "text-[#211f1d]" : "text-[#c45572]"
                }`}>
                  {item.event}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-[6px] bg-[#fff8f2] p-3">
            <p className="text-sm font-black text-[#211f1d]">Latte art class</p>
            <p className="mt-1 text-xs font-bold leading-5 text-[#6f6259]">
              Share a pour, cafe corner, or flower pairing for the community feed.
            </p>
          </div>
          <div className="rounded-[6px] bg-[#fff8f2] p-3">
            <p className="text-sm font-black text-[#211f1d]">Weekend cafe crawl</p>
            <p className="mt-1 text-xs font-bold leading-5 text-[#6f6259]">
              Save ideas for the next cafe and bouquet inspiration run.
            </p>
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
