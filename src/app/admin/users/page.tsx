import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { getAdminUsers } from "@/app/admin/_lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <>
      <AdminPageHeader
        eyebrow="User management"
        title="Registered users"
        description="Review Bloom & Brew accounts, profile locations, post counts, and follower/following relationships."
        aside="Read-only"
      />

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#fff8f2] text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3 text-right">Posts</th>
                <th className="px-5 py-3 text-right">Followers</th>
                <th className="px-5 py-3 text-right">Following</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[#f2e8df]">
                  <td className="px-5 py-3">
                    <p className="font-black text-[#211f1d]">{user.name}</p>
                    <p className="text-xs font-bold text-[#8a7d73]">@{user.username}</p>
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
                </tr>
              ))}
              {!users.length ? (
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
