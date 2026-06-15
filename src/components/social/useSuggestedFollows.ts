"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { DemoUser, SuggestedPerson } from "@/types/social";

type UseSuggestedFollowsOptions = {
  addNotification: (message: string) => void;
  isAuthenticated: boolean;
  requireAuth: (action: string) => boolean;
  setCurrentUser: Dispatch<SetStateAction<DemoUser | null>>;
};

export function useSuggestedFollows({
  addNotification,
  isAuthenticated,
  requireAuth,
  setCurrentUser,
}: UseSuggestedFollowsOptions) {
  const [suggestedFollows, setSuggestedFollows] = useState<SuggestedPerson[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);
  const [followRefreshKey, setFollowRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSuggestedFollows() {
      if (!isAuthenticated) {
        setSuggestedFollows([]);
        setIsSuggestionsLoading(false);
        return;
      }

      setIsSuggestionsLoading(true);

      try {
        const response = await fetch("/api/users/suggestions");
        const data = (await response.json()) as { people?: SuggestedPerson[] };

        if (active) {
          setSuggestedFollows(data.people ?? []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setIsSuggestionsLoading(false);
        }
      }
    }

    loadSuggestedFollows();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  async function toggleFollow(person: SuggestedPerson) {
    if (!requireAuth("follow creators")) {
      return;
    }

    if (!person.id) {
      addNotification("This suggested creator is not available yet.");
      return;
    }

    if (pendingFollowId) {
      return;
    }

    setPendingFollowId(person.id);

    try {
      const response = await fetch(`/api/users/${person.id}/follow`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        isFollowing?: boolean;
        username?: string;
        error?: string;
      };

      if (!response.ok || typeof data.isFollowing !== "boolean") {
        throw new Error(data.error ?? "Follow status could not be updated.");
      }

      setSuggestedFollows((current) =>
        current.map((item) =>
          item.id === person.id ? { ...item, isFollowing: data.isFollowing } : item,
        ),
      );
      setCurrentUser((user) => {
        if (!user) {
          return user;
        }

        const currentFollowing = user.stats?.following ?? 0;

        return {
          ...user,
          stats: {
            followers: user.stats?.followers ?? 0,
            following: data.isFollowing
              ? currentFollowing + 1
              : Math.max(currentFollowing - 1, 0),
          },
        };
      });
      setFollowRefreshKey((current) => current + 1);
      addNotification(
        data.isFollowing
          ? `You are now following @${data.username ?? person.username}.`
          : `You unfollowed @${data.username ?? person.username}.`,
      );
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Follow status could not be updated.",
      );
    } finally {
      setPendingFollowId(null);
    }
  }

  return {
    followRefreshKey,
    isSuggestionsLoading,
    pendingFollowId,
    suggestedFollows,
    toggleFollow,
  };
}
