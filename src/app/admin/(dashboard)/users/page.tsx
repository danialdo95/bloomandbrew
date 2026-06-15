import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { getAdminUsers } from "@/app/admin/_lib/admin-data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const users = await getAdminUsers();
  const params = await searchParams;
  const query = params?.q?.toLowerCase() ?? "";

const filteredUsers = users.filter((user) => {
  return (
    user.name?.toLowerCase().includes(query) ||
    user.username?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    user.location?.toLowerCase().includes(query)
  );
});

  return (
    <>
      <AdminPageHeader
        eyebrow="User management"
        title="Registered users"
        description="Review Bloom & Brew accounts, profile locations, post counts, and follower/following relationships."
        aside="Read-only"
      />
<form className="mt-5 flex items-center gap-3">
  <input
    type="text"
    name="q"
    defaultValue={query}
    placeholder="Search users..."
    className="h-10 w-full rounded-[6px] border border-[#eadfd4] px-4 text-sm"
  />

  <button
    type="submit"
    className="rounded-[6px] bg-[#211f1d] px-4 py-2 text-sm font-bold text-white"
  >
    Search
  </button>
</form>
      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
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
             {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-[#f2e8df]">
                  <td className="px-5 py-3">
                    <p className="font-black text-[#211f1d]">{user.name}</p>
                    <p className="text-xs font-bold text-[#8a7d73]">@{user.username}</p>
                  </td>
                  <td className="px-5 py-3">
                  {user.status === "ACTIVE" ? (
  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
    ACTIVE
  </span>
) : (
  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
    DISABLED
  </span>
)}
                  </td>
                  <td className="px-5 py-3 font-bold text-[#6f6259]">{user.email}</td>
                  <td className="px-5 py-3 font-bold text-[#6f6259]">
                    {user.location ?? "Not set"}
                  </td>
                  <td className="px-5 py-3 text-right font-black text-[#211f1d]">
                    {user._count.posts}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[#6f6259]">
                    {user._count.followers}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[#6f6259]">
                    {user._count.following}
                  </td>
                  <td className="px-5 py-3 text-right">
            <Link
                href={`/admin/users/${user.id}/edit`}
                className="rounded-[6px] border border-[#eadfd4] px-3 py-2 text-xs font-bold text-[#211f1d]"
                  >
                 Edit
                </Link>
                    </td>
                </tr>
              ))}
             {!filteredUsers.length ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center font-bold text-[#8a7d73]">
                    No registered users yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
