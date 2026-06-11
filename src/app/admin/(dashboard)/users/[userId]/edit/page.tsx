import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminUsers } from "@/app/admin/_lib/admin-data";

async function updateUserDetails(formData: FormData) {
  "use server";

  const userId = formData.get("userId");
  const name = formData.get("name");
  const email = formData.get("email");
  const location = formData.get("location");

  if (
    typeof userId !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof location !== "string"
  ) return;

  await prisma.user.update({
    where: { id: userId },
    data: { name, email, location },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

async function updateUserStatus(formData: FormData) {
  "use server";

  const userId = formData.get("userId");
  const status = formData.get("status");

  if (typeof userId !== "string" || typeof status !== "string") return;

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/edit`);
}

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
       <form
  id="edit-user-form"
  action={updateUserDetails}
  className="grid gap-4"
>
          <input type="hidden" name="userId" value={userId} />

          <label className="grid gap-2 text-sm font-bold text-[#211f1d]">
            Name
            <input
              type="text"
              name="name"
              defaultValue={user?.name ?? ""}
              className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#211f1d]">
            Email
            <input
              type="email"
              name="email"
              defaultValue={user?.email ?? ""}
              className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#211f1d]">
            Location
            <input
              type="text"
              name="location"
              defaultValue={user?.location ?? ""}
              className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm"
            />
          </label>

        </form>

        <div className="mt-4 rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] p-4">
          <p className="text-sm font-bold text-[#211f1d]">Account Status</p>

          <div className="mt-2">
            {user?.status === "ACTIVE" ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                ACTIVE
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                DISABLED
              </span>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <form action={updateUserStatus}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="status" value="DISABLED" />

              <button
                type="submit"
                className={
                  user?.status === "ACTIVE"
                    ? "rounded-[6px] bg-[#211f1d] px-4 py-2 text-sm font-bold text-white"
                    : "rounded-[6px] border border-[#eadfd4] px-4 py-2 text-sm font-bold text-[#211f1d]"
                }
              >
                Disable User
              </button>
            </form>

            <form action={updateUserStatus}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="status" value="ACTIVE" />

              <button
                type="submit"
                className={
                  user?.status === "DISABLED"
                    ? "rounded-[6px] bg-[#211f1d] px-4 py-2 text-sm font-bold text-white"
                    : "rounded-[6px] border border-[#eadfd4] px-4 py-2 text-sm font-bold text-[#211f1d]"
                }
              >
                Reactivate User
              </button>
            </form>
          </div>
        </div>

<button
  form="edit-user-form"
  type="submit"
  className="mt-6 w-fit rounded-[6px] bg-[#211f1d] px-5 py-2 text-sm font-bold text-white"
>
  Save Changes
</button>

      </section>

    </main>
  );
}