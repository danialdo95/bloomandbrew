import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AdminConfirmSubmitButton } from "@/app/admin/_components/AdminConfirmSubmitButton";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { AdminPagination } from "@/app/admin/_components/AdminPagination";
import {
  formatAdminDate,
  getAdminCalendarEvents,
  normalizeAdminPage,
  truncateAdminText,
} from "@/app/admin/_lib/admin-data";
import {
  CALENDAR_EVENT_STATUSES,
  CALENDAR_EVENT_TYPES,
  CALENDAR_EVENT_VISIBILITIES,
  isCalendarEventStatus,
  isCalendarEventType,
  isCalendarEventVisibility,
} from "@/lib/calendar";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminCalendarPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    type?: string;
    page?: string;
    updated?: string;
  }>;
};

async function ensureAdminAction() {
  const user = await getCurrentUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  return user;
}

function getReturnTo(value: FormDataEntryValue | null, fallback = "/admin/calendar") {
  return typeof value === "string" && value.startsWith("/admin/calendar")
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
  if (value === "created") {
    return "Calendar event was created.";
  }

  if (value === "updated") {
    return "Calendar event was updated.";
  }

  if (value === "deleted") {
    return "Calendar event was deleted.";
  }

  if (value === "invalid") {
    return "Calendar event needs a title, valid start date, type, status, and visibility.";
  }

  return "";
}

function getStatusBadge(status: string) {
  if (status === "SCHEDULED") {
    return "bg-green-100 text-green-700";
  }

  if (status === "DRAFT") {
    return "bg-yellow-100 text-yellow-800";
  }

  if (status === "CANCELLED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-[#fff8f2] text-[#6f6259]";
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value || null;
}

function parseDateTimeLocal(value: string) {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getEventInput(formData: FormData) {
  const title = getString(formData, "title");
  const eventType = getString(formData, "eventType").toUpperCase();
  const status = getString(formData, "status").toUpperCase();
  const visibility = getString(formData, "visibility").toUpperCase();
  const startsAt = parseDateTimeLocal(getString(formData, "startsAt"));
  const endsAtValue = getString(formData, "endsAt");
  const endsAt = endsAtValue ? parseDateTimeLocal(endsAtValue) : null;

  if (
    !title
    || !startsAt
    || (endsAtValue && !endsAt)
    || !isCalendarEventType(eventType)
    || !isCalendarEventStatus(status)
    || !isCalendarEventVisibility(visibility)
  ) {
    return null;
  }

  return {
    title,
    description: getOptionalString(formData, "description"),
    prompt: getOptionalString(formData, "prompt"),
    eventType,
    status,
    visibility,
    startsAt,
    endsAt,
  };
}

async function createCalendarEvent(formData: FormData) {
  "use server";

  const user = await ensureAdminAction();
  const returnTo = getReturnTo(formData.get("returnTo"));
  const input = getEventInput(formData);

  if (!input) {
    redirect(withFeedback(returnTo, "invalid"));
  }

  await prisma.calendarEvent.create({
    data: {
      ...input,
      createdById: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/calendar");
  redirect(withFeedback(returnTo, "created"));
}

async function updateCalendarEvent(formData: FormData) {
  "use server";

  await ensureAdminAction();
  const eventId = getString(formData, "eventId");
  const returnTo = getReturnTo(formData.get("returnTo"));
  const input = getEventInput(formData);

  if (!eventId || !input) {
    redirect(withFeedback(returnTo, "invalid"));
  }

  await prisma.calendarEvent.update({
    where: {
      id: eventId,
    },
    data: input,
  });

  revalidatePath("/");
  revalidatePath("/admin/calendar");
  redirect(withFeedback(returnTo, "updated"));
}

async function deleteCalendarEvent(formData: FormData) {
  "use server";

  await ensureAdminAction();
  const eventId = getString(formData, "eventId");
  const returnTo = getReturnTo(formData.get("returnTo"));

  if (!eventId) {
    return;
  }

  await prisma.calendarEvent.delete({
    where: {
      id: eventId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/calendar");
  redirect(withFeedback(returnTo, "deleted"));
}

export default async function AdminCalendarPage({ searchParams }: AdminCalendarPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const status = params?.status && params.status !== "all" ? params.status : "all";
  const type = params?.type && params.type !== "all" ? params.type : "all";
  const page = normalizeAdminPage(params?.page);
  const { events, pagination } = await getAdminCalendarEvents({
    page,
    query,
    status,
    type,
  });
  const feedback = getFeedbackMessage(params?.updated);
  const baseParams = new URLSearchParams();

  if (query) {
    baseParams.set("q", query);
  }

  if (status !== "all") {
    baseParams.set("status", status);
  }

  if (type !== "all") {
    baseParams.set("type", type);
  }

  if (page > 1) {
    baseParams.set("page", String(page));
  }

  const returnTo = `/admin/calendar${baseParams.toString() ? `?${baseParams.toString()}` : ""}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Calendar management"
        title="Content calendar"
        description="Schedule public post ideas, cafe campaigns, floral drops, and internal planning events that appear in the Bloom calendar sidebar."
        aside={`${pagination.total.toLocaleString()} events`}
      />

      {feedback ? (
        <p className={`mt-5 rounded-[6px] border px-4 py-3 text-sm font-black ${
          params?.updated === "invalid"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-green-200 bg-green-50 text-green-700"
        }`}
        >
          {feedback}
        </p>
      ) : null}

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <form className="grid gap-3 lg:grid-cols-[1fr_170px_170px_auto_auto] lg:items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search title, description, or post idea"
            className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm font-bold text-[#211f1d] outline-none transition placeholder:text-[#a69990] focus:border-[#c45572]"
          />
          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-4 text-sm font-black text-[#211f1d] outline-none transition focus:border-[#c45572]"
          >
            <option value="all">All statuses</option>
            {CALENDAR_EVENT_STATUSES.map((item) => (
              <option key={item} value={item.toLowerCase()}>{formatOption(item)}</option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={type}
            className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-4 text-sm font-black text-[#211f1d] outline-none transition focus:border-[#c45572]"
          >
            <option value="all">All types</option>
            {CALENDAR_EVENT_TYPES.map((item) => (
              <option key={item} value={item.toLowerCase()}>{formatOption(item)}</option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-[6px] bg-[#211f1d] px-4 text-sm font-black text-white transition hover:bg-[#c45572]"
          >
            Apply
          </button>
          {query || status !== "all" || type !== "all" ? (
            <a
              href="/admin/calendar"
              className="flex h-10 items-center justify-center rounded-[6px] border border-[#eadfd4] px-4 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
            >
              Clear
            </a>
          ) : null}
        </form>
      </section>

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <h3 className="text-lg font-black text-[#211f1d]">Create calendar event</h3>
        <CalendarEventForm
          action={createCalendarEvent}
          returnTo={returnTo}
          submitLabel="Create event"
        />
      </section>

      <section className="mt-5 overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="divide-y divide-[#f2e8df]">
          {events.map((event) => (
            <article key={event.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-black text-[#211f1d]">{event.title}</p>
                  <p className="mt-1 text-xs font-bold text-[#8a7d73]">
                    {formatAdminDate(event.startsAt)} · {formatEventTime(event.startsAt)}
                    {event.createdBy ? ` · by ${event.createdBy.name}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#fff8f2] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#c45572]">
                    {formatOption(event.eventType)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadge(event.status)}`}>
                    {formatOption(event.status)}
                  </span>
                  <span className="rounded-full bg-[#f7f1eb] px-3 py-1 text-xs font-black text-[#6f6259]">
                    {formatOption(event.visibility)}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#6f6259]">
                {event.description
                  ? truncateAdminText(event.description, 180)
                  : "No description added."}
              </p>

              {event.prompt ? (
                <p className="mt-3 rounded-[6px] bg-[#fff8f2] px-3 py-2 text-sm font-bold leading-6 text-[#211f1d]">
                  {truncateAdminText(event.prompt, 180)}
                </p>
              ) : null}

              <details className="mt-4 rounded-[6px] bg-[#fffaf6] p-3">
                <summary className="cursor-pointer text-sm font-black text-[#211f1d]">
                  Edit event
                </summary>
                <CalendarEventForm
                  action={updateCalendarEvent}
                  event={event}
                  returnTo={returnTo}
                  submitLabel="Save changes"
                />
                <form action={deleteCalendarEvent} className="mt-3">
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <AdminConfirmSubmitButton
                    title="Delete this event?"
                    message="This calendar event will be removed from the admin dashboard and the public Bloom calendar."
                    confirmLabel="Delete event"
                    warningTitle="Calendar event deletion"
                    warningMessage="This does not delete user posts, but the scheduled post idea will no longer be available."
                    className="rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:border-red-400"
                  >
                    Delete event
                  </AdminConfirmSubmitButton>
                </form>
              </details>
            </article>
          ))}

          {!events.length ? (
            <p className="px-5 py-8 text-center text-sm font-bold text-[#8a7d73]">
              {query || status !== "all" || type !== "all"
                ? "No calendar events match these filters."
                : "No calendar events yet."}
            </p>
          ) : null}
        </div>

        <AdminPagination
          basePath="/admin/calendar"
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.pageSize}
          params={{
            q: query,
            status: status === "all" ? undefined : status,
            type: type === "all" ? undefined : type,
          }}
        />
      </section>
    </>
  );
}

function CalendarEventForm({
  action,
  event,
  returnTo,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  event?: {
    id: string;
    title: string;
    description: string | null;
    prompt: string | null;
    eventType: string;
    status: string;
    visibility: string;
    startsAt: Date;
    endsAt: Date | null;
  };
  returnTo: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-4 grid gap-3">
      {event ? <input type="hidden" name="eventId" value={event.id} /> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          Title
          <input
            required
            name="title"
            defaultValue={event?.title ?? ""}
            className="h-10 rounded-[6px] border border-[#eadfd4] px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
          />
        </label>
        <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          Start date
          <input
            required
            type="datetime-local"
            name="startsAt"
            defaultValue={event ? formatDateTimeInput(event.startsAt) : ""}
            className="h-10 rounded-[6px] border border-[#eadfd4] px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
          />
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          Type
          <select
            name="eventType"
            defaultValue={event?.eventType ?? "CONTENT"}
            className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
          >
            {CALENDAR_EVENT_TYPES.map((item) => (
              <option key={item} value={item}>{formatOption(item)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          Status
          <select
            name="status"
            defaultValue={event?.status ?? "SCHEDULED"}
            className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
          >
            {CALENDAR_EVENT_STATUSES.map((item) => (
              <option key={item} value={item}>{formatOption(item)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          Visibility
          <select
            name="visibility"
            defaultValue={event?.visibility ?? "PUBLIC"}
            className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
          >
            {CALENDAR_EVENT_VISIBILITIES.map((item) => (
              <option key={item} value={item}>{formatOption(item)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          End date
          <input
            type="datetime-local"
            name="endsAt"
            defaultValue={event?.endsAt ? formatDateTimeInput(event.endsAt) : ""}
            className="h-10 rounded-[6px] border border-[#eadfd4] px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
          />
        </label>
      </div>

      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
        Description
        <textarea
          name="description"
          defaultValue={event?.description ?? ""}
          rows={3}
          className="rounded-[6px] border border-[#eadfd4] px-3 py-2 text-sm font-bold normal-case leading-6 tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
        />
      </label>

      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
        Post idea
        <textarea
          name="prompt"
          defaultValue={event?.prompt ?? ""}
          rows={3}
          className="rounded-[6px] border border-[#eadfd4] px-3 py-2 text-sm font-bold normal-case leading-6 tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
        />
      </label>

      <div>
        <button
          type="submit"
          className="rounded-[6px] bg-[#211f1d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#c45572]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function formatDateTimeInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatEventTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatOption(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
