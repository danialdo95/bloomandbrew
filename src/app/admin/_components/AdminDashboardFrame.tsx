"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const dashboardNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/trends", label: "Trends" },
  { href: "/admin/ai-suggestions", label: "AI Suggestions" },
  { href: "/admin/integrations", label: "Integrations" },
];

type AdminDashboardFrameProps = {
  children: ReactNode;
};

export function AdminDashboardFrame({ children }: AdminDashboardFrameProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="bg-[#fffaf6]">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)]">
          <div className="rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
              Admin
            </p>
            <h1 className="mt-2 text-xl font-black leading-7 text-[#211f1d]">
              Insights dashboard
            </h1>
            <div className="mt-5 grid gap-1">
              {dashboardNav.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-[6px] px-3 py-2 text-sm font-black transition ${
                      isActive
                        ? "bg-[#211f1d] text-white"
                        : "text-[#6f6259] hover:bg-[#fff8f2] hover:text-[#211f1d]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 rounded-[6px] bg-[#fff176] p-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#211f1d]">
                Next action
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#211f1d]">
                Add moderation controls and admin-only access.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-[6px] border border-[#eadfd4] bg-white px-3 py-2 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
