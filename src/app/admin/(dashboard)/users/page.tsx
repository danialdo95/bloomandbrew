import Link from "next/link";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { AdminPagination } from "@/app/admin/_components/AdminPagination";
import {
  getAdminUsers,
  normalizeAdminPage,
} from "@/app/admin/_lib/admin-data";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    updated?: string;
  }>;
};

function getStatusBadge(status: string) {
  return status === "ACTIVE"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
}

function getFeedbackMessage(value?: string) {
  if (value === "saved") {
    return "User details were updated.";
  }

  if (value === "disabled") {
    return "User account was disabled.";
  }

  if (value === "active") {
    return "User account was reactivated.";
  }

  return "";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const page = normalizeAdminPage(params?.page);
  const feedback = getFeedbackMessage(params?.updated);
  const { users, pagination } = await getAdminUsers({ page, query });

  return (
    <>
      <AdminPageHeader
        eyebrow="User management"
        title="Registered users"
        description="Search accounts, review profile details, and manage active or disabled user status."
        aside={`${pagination.total.toLocaleString()} users`}
      />

      {feedback ? (
        <p className="mt-5 rounded-[6px] border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700">
          {feedback}
        </p>
      ) : null}

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <form className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, username, email, or location"
            className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm font-bold text-[#211f1d] outline-none transition placeholder:text-[#a69990] focus:border-[#c45572]"
          />
          <button
            type="submit"
            className="h-10 rounded-[6px] bg-[#211f1d] px-4 text-sm font-black text-white transition hover:bg-[#c45572]"
          >
            Search
          </button>
          {query ? (
            <Link
              href="/admin/users"
              className="flex h-10 items-center justify-center rounded-[6px] border border-[#eadfd4] px-4 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
            >
              Clear
            </Link>
          ) : null}
        </form>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          {pagination.total.toLocaleString()} result
          {pagination.total === 1 ? "" : "s"}
          {query ? ` for "${query}"` : ""}
        </p>
      </section>

      <section className="mt-5 overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#fff8f2] text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3 text-right">Posts</th>
                <th className="px-5 py-3 text-right">Followers</th>
                <th className="px-5 py-3 text-right">Following</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[#f2e8df] align-top">
                  <td className="px-5 py-4">
                    <p className="font-black text-[#211f1d]">{user.name}</p>
                    <p className="mt-1 text-xs font-bold text-[#8a7d73]">
                      @{user.username}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadge(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#6f6259]">
                    {user.email}
                  </td>
                  <td className="px-5 py-4 font-bold text-[#6f6259]">
                    {user.location ?? "Not set"}
                  </td>
                  <td className="px-5 py-4 text-right font-black text-[#211f1d]">
                    {user._count.posts}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#6f6259]">
                    {user._count.followers}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#6f6259]">
                    {user._count.following}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="inline-flex rounded-[6px] border border-[#eadfd4] px-3 py-2 text-xs font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!users.length ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center font-bold text-[#8a7d73]"
                  >
                    {query
                      ? "No users match this search."
                      : "No registered users yet."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <AdminPagination
          basePath="/admin/users"
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.pageSize}
          params={{ q: query }}
        />
      </section>
    </>
  );
}
