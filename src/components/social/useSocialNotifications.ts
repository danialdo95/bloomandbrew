"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NotificationItem } from "@/types/social";

const initialNotifications: NotificationItem[] = [
  {
    id: "welcome",
    text: "Welcome back. Your Bloom & Brew feed is ready.",
    createdAt: "Now",
  },
];

export function useSocialNotifications(isAuthenticated: boolean) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const isAuthenticatedRef = useRef(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      if (!isAuthenticated) {
        setNotifications(initialNotifications);
        return;
      }

      try {
        const response = await fetch("/api/notifications");
        const data = (await response.json()) as {
          notifications?: NotificationItem[];
        };

        if (active && response.ok) {
          setNotifications(data.notifications?.length ? data.notifications : initialNotifications);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("bloom-notifications", {
        detail: notifications,
      }),
    );
  }, [notifications]);

  const addNotification = useCallback((text: string) => {
    const optimisticNotification = {
      id: crypto.randomUUID(),
      text,
      createdAt: "Now",
    };

    setNotifications((current) => [
      optimisticNotification,
      ...current.slice(0, 19),
    ]);

    if (!isAuthenticatedRef.current) {
      return;
    }

    fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          notification?: NotificationItem;
        };

        if (!data.notification) {
          return;
        }

        setNotifications((current) =>
          current.map((notification) =>
            notification.id === optimisticNotification.id
              ? data.notification as NotificationItem
              : notification,
          ),
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return {
    addNotification,
    notifications,
  };
}
