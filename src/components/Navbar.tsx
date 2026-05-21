"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { NotificationItem } from "@/types/social";

const navItems = [
  { href: "/", label: "Feed" },
  { href: "/discover", label: "Discover" },
  { href: "/trends", label: "Trends" },
  { href: "/community", label: "Community" },
];

type NotificationEvent = CustomEvent<NotificationItem[]>;

function formatNotificationTime(value: string) {
  if (value === "Now") {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [browserNotificationStatus, setBrowserNotificationStatus] =
    useState("Browser alerts");

  useEffect(() => {
    function handleNotifications(event: Event) {
      setNotifications((event as NotificationEvent).detail ?? []);
    }

    window.addEventListener("bloom-notifications", handleNotifications);

    return () => {
      window.removeEventListener("bloom-notifications", handleNotifications);
    };
  }, []);

  function announceNotificationStatus(text: string) {
    window.dispatchEvent(
      new CustomEvent("bloom-browser-notification-status", {
        detail: text,
      }),
    );
  }

  function requestBrowserNotifications() {
    if (!("Notification" in window)) {
      setBrowserNotificationStatus("Not supported");
      announceNotificationStatus("Browser notifications are not supported here.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      setBrowserNotificationStatus(
        permission === "granted" ? "Alerts enabled" : `Alerts ${permission}`,
      );

      if (permission === "granted") {
        new Notification("Bloom & Brew Social", {
          body: "Browser alerts are enabled for this demo.",
        });
      }

      announceNotificationStatus(`Notification permission: ${permission}.`);
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#ece2d8] bg-white/95 backdrop-blur">
      <div className="bg-[#fff176] px-4 py-2 text-center text-xs font-bold text-[#211f1d] md:text-sm">
        Bloom & Brew Social: post, follow, chat, share, and discover cafe-floral culture
      </div>
      <nav className="relative mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:px-5 md:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 justify-self-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-xl font-black text-[#211f1d] md:h-11 md:w-11">
            ✿
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-black leading-5 text-[#211f1d] md:text-lg">
              Bloom & Brew
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a7d73] md:text-xs">
              Social
            </span>
          </span>
        </Link>

        <div className="hidden items-center justify-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-[#211f1d] transition hover:text-[#c45572]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((current) => !current)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfd4] bg-[#fff8f2] text-base font-black text-[#211f1d]"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
            >
              🔔
              {notifications.length ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c45572] px-1 text-[10px] font-black text-white">
                  {notifications.length}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_16px_48px_rgba(33,31,29,0.18)]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-black text-[#211f1d]">Notifications</h2>
                  <span className="rounded-full bg-[#fff176] px-2 py-1 text-xs font-black">
                    {notifications.length}
                  </span>
                </div>
                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                  <button
                    type="button"
                    onClick={requestBrowserNotifications}
                    className="w-full rounded-[6px] border border-[#eadfd4] bg-white px-3 py-2 text-left text-xs font-black text-[#211f1d] transition hover:bg-[#fff8f2]"
                  >
                    🔔 {browserNotificationStatus}
                  </button>
                  {notifications.length ? (
                    notifications.map((item) => (
                      <div key={item.id} className="rounded-[6px] bg-[#fff8f2] p-3">
                        <p className="text-sm font-bold leading-6 text-[#211f1d]">
                          {item.text}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#8a7d73]">
                          {formatNotificationTime(item.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-[6px] bg-[#fff8f2] p-3 text-sm font-bold text-[#6f6259]">
                      No notifications yet.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfd4] bg-white text-xl font-black text-[#211f1d] md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {menuOpen ? (
          <div className="absolute left-4 right-4 top-[calc(100%+0.5rem)] rounded-[6px] border border-[#eadfd4] bg-white p-3 shadow-[0_16px_48px_rgba(33,31,29,0.18)] md:hidden">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-[6px] px-3 py-3 text-sm font-black text-[#211f1d] hover:bg-[#fff8f2]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
