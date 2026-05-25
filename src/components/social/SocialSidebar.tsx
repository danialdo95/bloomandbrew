import { TrendTags } from "@/components/TrendTags";

const calendarDays = [
  { label: "Mon", day: "25", event: null },
  { label: "Tue", day: "26", event: "Latte art" },
  { label: "Wed", day: "27", event: null },
  { label: "Thu", day: "28", event: "Bouquet drop" },
  { label: "Fri", day: "29", event: null },
  { label: "Sat", day: "30", event: "Cafe crawl" },
  { label: "Sun", day: "31", event: null },
];

type SocialSidebarProps = {
  trends: Array<{ label: string; count: number }>;
  source: "reddit" | "fallback";
};

export function SocialSidebar({ trends, source }: SocialSidebarProps) {
  return (
    <aside className="order-3 space-y-5 lg:order-none">
      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c45572]">
              Bloom calendar
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#211f1d]">May 2026</h2>
          </div>
          <span className="rounded-full bg-[#fff176] px-3 py-1 text-xs font-black text-[#211f1d]">
            This week
          </span>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {calendarDays.map((item) => (
            <div
              key={item.day}
              className={`min-h-20 rounded-[6px] border px-2 py-2 text-center ${
                item.event
                  ? "border-[#c45572] bg-[#fff8f2]"
                  : "border-[#eadfd4] bg-white"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8a7d73]">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-black text-[#211f1d]">{item.day}</p>
              {item.event ? (
                <p className="mt-1 text-[10px] font-black leading-4 text-[#c45572]">
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
          Source: {source === "reddit" ? "Live Reddit feed" : "Fallback demo feed"}
        </p>
      </section>
    </aside>
  );
}
