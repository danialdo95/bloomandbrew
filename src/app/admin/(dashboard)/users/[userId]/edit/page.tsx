import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { AdminSubmitButton } from "@/app/admin/_components/AdminSubmitButton";
import { getAdminUserById } from "@/app/admin/_lib/admin-data";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getStatusBadge(status: string) {
  return status === "ACTIVE"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
}

function getFeedbackMessage(value?: string) {
  if (value === "saved") {
    return "User details were saved.";
  }

  if (value === "disabled") {
    return "User account was disabled.";
  }

  if (value === "active") {
    return "User account was reactivated.";
  }

  if (value === "invalid") {
    return "Name and email are required before saving.";
  }

  if (value === "email") {
    return "That email address is already used by another account.";
  }

  return "";
}

function getFeedbackClass(value?: string) {
  return value === "invalid" || value === "email"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-green-200 bg-green-50 text-green-700";
}

async function ensureAdminAction() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    redirect("/admin/login");
  }
}

async function updateUserDetails(formData: FormData) {
  "use server";

  await ensureAdminAction();

  const userId = formData.get("userId");
  const name = formData.get("name");
  const email = formData.get("email");
  const location = formData.get("location");

  if (
    typeof userId !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof location !== "string"
  ) {
    return;
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedLocation = location.trim();

  if (!normalizedName || !normalizedEmail) {
    redirect(`/admin/users/${userId}/edit?updated=invalid`);
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: normalizedName,
        email: normalizedEmail,
        location: normalizedLocation || null,
      },
    });
  } catch {
    redirect(`/admin/users/${userId}/edit?updated=email`);
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/edit`);
  redirect("/admin/users?updated=saved");
}

async function updateUserStatus(formData: FormData) {
  "use server";

  await ensureAdminAction();

  const userId = formData.get("userId");
  const status = formData.get("status");

  if (typeof userId !== "string" || typeof status !== "string") {
    return;
  }

  if (status !== "ACTIVE" && status !== "DISABLED") {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/edit`);
  redirect(`/admin/users/${userId}/edit?updated=${status === "ACTIVE" ? "active" : "disabled"}`);
}

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<{ updated?: string }>;
}) {
  const { userId } = await params;
  const query = await searchParams;
  const feedback = getFeedbackMessage(query?.updated);
  const user = await getAdminUserById(userId);

  if (!user) {
    notFound();
  }

  return (
    <main className="space-y-5">
      <div>
        <Link
          href="/admin/users"
          className="text-xs font-black uppercase tracking-[0.16em] text-[#c45572] transition hover:text-[#211f1d]"
        >
          Back to users
        </Link>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-[#a65f2b]">
          User management
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#211f1d]">
          Edit {user.name}
        </h1>
        <p className="mt-2 text-sm font-bold text-[#6b625c]">
          Update profile details and control whether the account is active.
        </p>
      </div>

      {feedback ? (
        <p
          className={`rounded-[6px] border px-4 py-3 text-sm font-black ${getFeedbackClass(query?.updated)}`}
        >
          {feedback}
        </p>
      ) : null}

      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <form id="edit-user-form" action={updateUserDetails} className="grid gap-4">
          <input type="hidden" name="userId" value={userId} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-[#211f1d]">
              Name
              <input
                type="text"
                name="name"
                defaultValue={user.name}
                required
                className="h-11 rounded-[6px] border border-[#eadfd4] px-4 text-sm font-bold outline-none transition focus:border-[#c45572]"
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#211f1d]">
              Email
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                className="h-11 rounded-[6px] border border-[#eadfd4] px-4 text-sm font-bold outline-none transition focus:border-[#c45572]"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-black text-[#211f1d]">
            Location
            <input
              type="text"
              name="location"
              defaultValue={user.location ?? ""}
              className="h-11 rounded-[6px] border border-[#eadfd4] px-4 text-sm font-bold outline-none transition focus:border-[#c45572]"
            />
          </label>

          <div className="mt-2 flex flex-wrap gap-3">
            <AdminSubmitButton
              pendingLabel="Saving…"
              className="rounded-[6px] bg-[#211f1d] px-5 py-2 text-sm font-black text-white transition hover:bg-[#c45572] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save changes
            </AdminSubmitButton>
            <Link
              href="/admin/users"
              className="rounded-[6px] border border-[#eadfd4] px-5 py-2 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-5 rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#211f1d]">Account status</p>
              <p className="mt-1 text-sm font-bold leading-6 text-[#6f6259]">
                Disabled accounts should be blocked from future login and posting
                workflows in the next hardening step.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadge(user.status)}`}
            >
              {user.status}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <form action={updateUserStatus}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="status" value="DISABLED" />
              <AdminSubmitButton
                disabled={user.status === "DISABLED"}
                pendingLabel="Disabling…"
                className="rounded-[6px] border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-black text-yellow-800 transition hover:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Disable user
              </AdminSubmitButton>
            </form>

            <form action={updateUserStatus}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="status" value="ACTIVE" />
              <AdminSubmitButton
                disabled={user.status === "ACTIVE"}
                pendingLabel="Reactivating…"
                className="rounded-[6px] border border-green-200 bg-green-50 px-4 py-2 text-sm font-black text-green-700 transition hover:border-green-400 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Reactivate user
              </AdminSubmitButton>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
