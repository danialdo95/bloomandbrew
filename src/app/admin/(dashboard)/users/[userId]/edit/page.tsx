import { getAdminUsers } from "@/app/admin/_lib/admin-data";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const users = await getAdminUsers();
  const user = users.find((item) => item.id === userId);

  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#a65f2b]">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-black text-[#211f1d]">
          Edit User
        </h1>

        <p className="mt-2 text-sm text-[#6b625c]">
          Editing user ID: {userId}
        </p>
      </div>

      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5">
        <form className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-[#211f1d]">
            Name
            <input
              type="text"
              defaultValue={user?.name ?? ""}
              className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#211f1d]">
            Email
            <input
              type="email"
              defaultValue={user?.email ?? ""}
              className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#211f1d]">
            Location
            <input
              type="text"
              defaultValue={user?.location ?? ""}
              className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm"
            />
          </label>

          <button
            type="button"
            className="w-fit rounded-[6px] bg-[#211f1d] px-5 py-2 text-sm font-bold text-white"
          >
            Save Changes
          </button>
        </form>
      </section>
    </main>
  );
}