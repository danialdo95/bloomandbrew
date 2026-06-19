import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/app/admin/login/AdminLoginForm";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();

  if (isAdminUser(user)) {
    redirect("/admin");
  }

  if (user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#fffaf6] px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center">
        <section className="grid w-full overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_18px_55px_rgba(64,45,35,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[#211f1d] p-8 text-white sm:p-10">
            <Link
              href="/"
              className="inline-flex rounded-[6px] border border-white/20 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/85 transition hover:border-white hover:text-white"
            >
              Bloom & Brew
            </Link>
            <div className="mt-16">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#fff176]">
                Admin access
              </p>
              <h1 className="mt-3 max-w-sm text-4xl font-black leading-tight">
                Manage the social ecosystem with a focused dashboard.
              </h1>
              <p className="mt-5 max-w-sm text-sm font-bold leading-6 text-white/72">
                Authorized administrators can review users, posts, trends,
                integrations, and AI-assisted content suggestions.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
              Secure sign in
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#211f1d]">
              Admin dashboard
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-[#756b63]">
              Sign in with an authorized Bloom & Brew administrator account to
              manage platform activity and content operations.
            </p>

            <AdminLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
