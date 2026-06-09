import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { getAdminIntegrations } from "@/app/admin/_lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  const integrationStatus = await getAdminIntegrations();

  return (
    <>
      <AdminPageHeader
        eyebrow="Integration management"
        title="External source health"
        description="Review Reddit, YouTube, and mirrored external interaction status for the social media ecosystem."
        aside="Operational"
      />

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {integrationStatus.map((source) => (
          <article
            key={source.label}
            className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c45572]">
                  Source
                </p>
                <h2 className="mt-2 text-xl font-black text-[#211f1d]">
                  {source.label}
                </h2>
              </div>
              <span className="rounded-full bg-[#fff176] px-3 py-1 text-xs font-black text-[#211f1d]">
                {source.status}
              </span>
            </div>
            <p className="mt-4 text-sm font-bold leading-6 text-[#6f6259]">
              {source.detail}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
