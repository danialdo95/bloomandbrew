import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { getAdminTrends } from "@/app/admin/_lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminTrendsPage() {
  const { source, trends } = await getAdminTrends(14);
  const highestTrendCount = Math.max(trends[0]?.count ?? 1, 1);

  return (
    <>
      <AdminPageHeader
        eyebrow="Trend management"
        title="Active topic signals"
        description="Track keyword frequency across Reddit community content and recent Bloom & Brew posts."
        aside={source === "reddit" ? "Live Reddit" : "Fallback"}
      />

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="grid gap-3 md:grid-cols-2">
          {trends.map((trend) => (
            <div key={trend.label} className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-[#211f1d]">{trend.label}</p>
                <span className="text-xs font-black text-[#c45572]">{trend.count}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f0ded4]">
                <div
                  className="h-full rounded-full bg-[#f7c6cf]"
                  style={{
                    width: `${Math.max((trend.count / highestTrendCount) * 100, 8)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
