import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AdminConfirmSubmitButton } from "@/app/admin/_components/AdminConfirmSubmitButton";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { AdminPagination } from "@/app/admin/_components/AdminPagination";
import {
  formatAdminDate,
  getAdminAiSuggestions,
  getAdminTrends,
  normalizeAdminPage,
} from "@/app/admin/_lib/admin-data";
import { generateProviderAwareSuggestions, getSuggestionProviderLabel } from "@/lib/ai/suggestions";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminAiSuggestionsPageProps = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
    updated?: string;
  }>;
};

const suggestionStatuses = ["PENDING", "APPROVED", "DISMISSED", "ADDED_TO_CALENDAR"];

async function ensureAdminAction() {
  const user = await getCurrentUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  return user;
}

function getReturnTo(value: FormDataEntryValue | null, fallback = "/admin/ai-suggestions") {
  return typeof value === "string" && value.startsWith("/admin/ai-suggestions")
    ? value
    : fallback;
}

function withFeedback(path: string, feedback: string) {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString);
  params.set("updated", feedback);

  return `${pathname}?${params.toString()}`;
}

function getFeedbackMessage(value?: string) {
  if (value === "generated") {
    return "New post ideas were generated for admin review.";
  }

  if (value === "approved") {
    return "Suggestion was approved.";
  }

  if (value === "dismissed") {
    return "Suggestion was dismissed.";
  }

  if (value === "calendar") {
    return "Suggestion was added to the calendar as a draft post idea.";
  }

  if (value === "empty") {
    return "No trend signals were available to generate suggestions.";
  }

  return "";
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

async function generateSuggestions(formData: FormData) {
  "use server";

  const user = await ensureAdminAction();
  const returnTo = getReturnTo(formData.get("returnTo"));
  const { trends } = await getAdminTrends(8);
  const generatedSuggestions = await generateProviderAwareSuggestions(trends);

  if (!generatedSuggestions.length) {
    redirect(withFeedback(returnTo, "empty"));
  }

  await prisma.aiSuggestion.createMany({
    data: generatedSuggestions.map((suggestion) => ({
      title: suggestion.title,
      postIdea: suggestion.postIdea,
      hashtags: suggestion.hashtags,
      sourceTrend: suggestion.sourceTrend,
      provider: suggestion.provider,
      eventType: suggestion.eventType,
      status: "PENDING",
      createdById: user.id,
    })),
  });

  revalidatePath("/admin/ai-suggestions");
  redirect(withFeedback(returnTo, "generated"));
}

async function updateSuggestionStatus(formData: FormData) {
  "use server";

  await ensureAdminAction();
  const suggestionId = getString(formData, "suggestionId");
  const status = getString(formData, "status").toUpperCase();
  const returnTo = getReturnTo(formData.get("returnTo"));

  if (!suggestionId || (status !== "APPROVED" && status !== "DISMISSED")) {
    return;
  }

  await prisma.aiSuggestion.update({
    where: {
      id: suggestionId,
    },
    data: {
      status,
    },
  });

  revalidatePath("/admin/ai-suggestions");
  redirect(withFeedback(returnTo, status === "APPROVED" ? "approved" : "dismissed"));
}

async function addSuggestionToCalendar(formData: FormData) {
  "use server";

  const user = await ensureAdminAction();
  const suggestionId = getString(formData, "suggestionId");
  const returnTo = getReturnTo(formData.get("returnTo"));

  if (!suggestionId) {
    return;
  }

  const suggestion = await prisma.aiSuggestion.findUnique({
    where: {
      id: suggestionId,
    },
  });

  if (!suggestion) {
    return;
  }

  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      title: suggestion.title,
      description: `Post idea generated from the "${suggestion.sourceTrend}" trend.`,
      prompt: suggestion.postIdea,
      eventType: suggestion.eventType,
      status: "DRAFT",
      visibility: "PUBLIC",
      startsAt: getNextCalendarDraftDate(),
      createdById: user.id,
    },
  });

  await prisma.aiSuggestion.update({
    where: {
      id: suggestion.id,
    },
    data: {
      status: "ADDED_TO_CALENDAR",
      calendarEventId: calendarEvent.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/ai-suggestions");
  redirect(withFeedback(returnTo, "calendar"));
}

export default async function AdminAiSuggestionsPage({
  searchParams,
}: AdminAiSuggestionsPageProps) {
  const params = await searchParams;
  const status = params?.status && params.status !== "all" ? params.status : "all";
  const page = normalizeAdminPage(params?.page);
  const { suggestions, pagination } = await getAdminAiSuggestions({ page, status });
  const feedback = getFeedbackMessage(params?.updated);
  const providerLabel = getSuggestionProviderLabel();
  const baseParams = new URLSearchParams();

  if (status !== "all") {
    baseParams.set("status", status);
  }

  if (page > 1) {
    baseParams.set("page", String(page));
  }

  const returnTo = `/admin/ai-suggestions${baseParams.toString() ? `?${baseParams.toString()}` : ""}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="AI suggestions"
        title="Provider-aware post ideas"
        description="Generate trend-based post ideas with DeepSeek when configured, or with the local trend engine when no API key is available."
        aside={`Provider: ${providerLabel}`}
      />

      {feedback ? (
        <p className={`mt-5 rounded-[6px] border px-4 py-3 text-sm font-black ${
          params?.updated === "empty"
            ? "border-yellow-200 bg-yellow-50 text-yellow-800"
            : "border-green-200 bg-green-50 text-green-700"
        }`}
        >
          {feedback}
        </p>
      ) : null}

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <form className="grid gap-3 lg:grid-cols-[1fr_190px_auto_auto] lg:items-center">
          <p className="text-sm font-bold leading-6 text-[#6f6259]">
            Generate suggestions from current Bloom and external trend signals.
          </p>
          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-4 text-sm font-black text-[#211f1d] outline-none transition focus:border-[#c45572]"
          >
            <option value="all">All statuses</option>
            {suggestionStatuses.map((item) => (
              <option key={item} value={item.toLowerCase()}>{formatOption(item)}</option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
          >
            Filter
          </button>
          {status !== "all" ? (
            <a
              href="/admin/ai-suggestions"
              className="flex h-10 items-center justify-center rounded-[6px] border border-[#eadfd4] px-4 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
            >
              Clear
            </a>
          ) : null}
        </form>

        <form action={generateSuggestions} className="mt-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <button
            type="submit"
            className="rounded-[6px] bg-[#211f1d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#c45572]"
          >
            Generate post ideas
          </button>
        </form>
      </section>

      <section className="mt-5 overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="divide-y divide-[#f2e8df]">
          {suggestions.map((suggestion) => (
            <article key={suggestion.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c45572]">
                    {suggestion.provider === "DEEPSEEK" ? "DeepSeek" : "Local trend engine"}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#211f1d]">
                    {suggestion.title}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-[#8a7d73]">
                    Trend: {suggestion.sourceTrend} · {formatAdminDate(suggestion.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#fff8f2] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#c45572]">
                    {formatOption(suggestion.eventType)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadge(suggestion.status)}`}>
                    {formatOption(suggestion.status)}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm font-bold leading-6 text-[#6f6259]">
                {suggestion.postIdea}
              </p>
              <p className="mt-4 text-xs font-black leading-6 text-[#c45572]">
                {suggestion.hashtags.join(" ")}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[6px] bg-[#fffaf6] p-3">
                <p className="text-xs font-bold leading-5 text-[#6f6259]">
                  Review before publishing. Adding to calendar creates a draft
                  public post idea that admins can schedule and publish.
                </p>
                <div className="flex flex-wrap gap-2">
                  <SuggestionStatusForm
                    action={updateSuggestionStatus}
                    returnTo={returnTo}
                    status="APPROVED"
                    suggestionId={suggestion.id}
                    disabled={suggestion.status === "APPROVED"}
                  >
                    Approve
                  </SuggestionStatusForm>
                  <form action={addSuggestionToCalendar}>
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button
                      type="submit"
                      disabled={suggestion.status === "ADDED_TO_CALENDAR"}
                      className="rounded-[6px] border border-[#eadfd4] bg-white px-3 py-2 text-xs font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Add to calendar
                    </button>
                  </form>
                  <form action={updateSuggestionStatus}>
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <input type="hidden" name="status" value="DISMISSED" />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <AdminConfirmSubmitButton
                      title="Dismiss this suggestion?"
                      message="This suggestion will be marked as dismissed and removed from the active review flow."
                      confirmLabel="Dismiss"
                      warningTitle="Review action"
                      warningMessage="Dismissed suggestions stay stored for audit and comparison."
                      className="rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:border-red-400"
                    >
                      Dismiss
                    </AdminConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </article>
          ))}

          {!suggestions.length ? (
            <p className="px-5 py-8 text-center text-sm font-bold text-[#8a7d73]">
              No suggestions yet. Generate post ideas from current trends to start the review workflow.
            </p>
          ) : null}
        </div>

        <AdminPagination
          basePath="/admin/ai-suggestions"
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.pageSize}
          params={{ status: status === "all" ? undefined : status }}
        />
      </section>
    </>
  );
}

function SuggestionStatusForm({
  action,
  children,
  disabled,
  returnTo,
  status,
  suggestionId,
}: {
  action: (formData: FormData) => Promise<void>;
  children: string;
  disabled: boolean;
  returnTo: string;
  status: string;
  suggestionId: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="suggestionId" value={suggestionId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-[6px] border border-[#eadfd4] bg-white px-3 py-2 text-xs font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {children}
      </button>
    </form>
  );
}

function getNextCalendarDraftDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(10, 0, 0, 0);
  return date;
}

function getStatusBadge(status: string) {
  if (status === "PENDING") {
    return "bg-yellow-100 text-yellow-800";
  }

  if (status === "APPROVED" || status === "ADDED_TO_CALENDAR") {
    return "bg-green-100 text-green-700";
  }

  return "bg-red-50 text-red-700";
}

function formatOption(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
