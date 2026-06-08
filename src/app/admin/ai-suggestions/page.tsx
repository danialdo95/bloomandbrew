import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { getAdminTrends, getSuggestion } from "@/app/admin/_lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminAiSuggestionsPage() {
  const { trends } = await getAdminTrends(8);
  const suggestions = trends.slice(0, 6).map((trend, index) =>
    getSuggestion(trend.label, index),
  );

  return (
    <>
      <AdminPageHeader
        eyebrow="AI suggestions"
        title="Rule-based creator prompts"
        description="Convert trend signals into content ideas, hashtag suggestions, and creator prompts for cafe and florist communities."
        aside="Prototype"
      />

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {suggestions.map((suggestion) => (
          <article
            key={suggestion.title}
            className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c45572]">
              Content prompt
            </p>
            <h2 className="mt-2 text-xl font-black text-[#211f1d]">
              {suggestion.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6f6259]">
              {suggestion.detail}
            </p>
            <p className="mt-4 text-xs font-black leading-6 text-[#c45572]">
              {suggestion.hashtags.join(" ")}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
