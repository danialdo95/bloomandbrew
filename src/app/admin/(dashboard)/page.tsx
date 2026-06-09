import Link from "next/link";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { getAdminOverview } from "@/app/admin/_lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();
  const kpis = [
    {
      label: "Users",
      value: overview.totalUsers.toLocaleString(),
      detail: "Registered accounts",
      href: "/admin/users",
    },
    {
      label: "Bloom posts",
      value: overview.totalPosts.toLocaleString(),
      detail: "Database posts",
      href: "/admin/posts",
    },
    {
      label: "Comments",
      value: overview.totalComments.toLocaleString(),
      detail: "Stored replies",
      href: "/admin/posts",
    },
    {
      label: "Follows",
      value: overview.totalFollows.toLocaleString(),
      detail: `${overview.totalNotifications.toLocaleString()} notifications`,
      href: "/admin/users",
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin insights"
        title="Platform activity control center"
        description="Monitor Bloom & Brew users, posts, external sources, trend signals, and rule-based creator suggestions from focused management pages."
        aside={overview.redditFeed.source === "reddit" ? "Live Reddit" : "Fallback"}
      />

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_8px_24px_rgba(64,45,35,0.05)] transition hover:border-[#c45572]"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c45572]">
              {kpi.label}
            </p>
            <p className="mt-3 text-3xl font-black text-[#211f1d]">{kpi.value}</p>
            <p className="mt-1 text-sm font-bold text-[#756b63]">{kpi.detail}</p>
          </Link>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <Link
          href="/admin/trends"
          className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)] transition hover:border-[#c45572]"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
            Trend management
          </p>
          <h2 className="mt-2 text-xl font-black text-[#211f1d]">
            Review topic signals
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6f6259]">
            Inspect keyword movement across Reddit and Bloom posts.
          </p>
        </Link>
        <Link
          href="/admin/ai-suggestions"
          className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)] transition hover:border-[#c45572]"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
            AI suggestions
          </p>
          <h2 className="mt-2 text-xl font-black text-[#211f1d]">
            Generate creator prompts
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6f6259]">
            Convert trends into simple content ideas and hashtags.
          </p>
        </Link>
        <Link
          href="/admin/integrations"
          className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)] transition hover:border-[#c45572]"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
            Integrations
          </p>
          <h2 className="mt-2 text-xl font-black text-[#211f1d]">
            Check source health
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6f6259]">
            Review Reddit, YouTube, and mirrored external interaction status.
          </p>
        </Link>
      </section>
    </>
  );
}
