"use client";

import { useState } from "react";

import { LoadingSpinner } from "@/components/social/LoadingSpinner";

type PublicProfileFollowButtonProps = {
  userId: string;
  username: string;
  initialIsFollowing: boolean;
  canFollow: boolean;
  isSelf: boolean;
};

export function PublicProfileFollowButton({
  userId,
  username,
  initialIsFollowing,
  canFollow,
  isSelf,
}: PublicProfileFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function toggleFollow() {
    if (!canFollow || isSelf) {
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        isFollowing?: boolean;
        error?: string;
      };

      if (!response.ok || typeof data.isFollowing !== "boolean") {
        throw new Error(data.error ?? "Follow status could not be updated.");
      }

      setIsFollowing(data.isFollowing);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Follow status could not be updated.",
      );
    } finally {
      setIsPending(false);
    }
  }

  const label = isSelf
    ? "Your profile"
    : !canFollow
      ? "Sign in to follow"
      : isFollowing
        ? "Following"
        : "Follow";

  return (
    <div>
      <button
        type="button"
        onClick={toggleFollow}
        disabled={!canFollow || isSelf || isPending}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${
          isFollowing
            ? "border border-[#211f1d] bg-white text-[#211f1d]"
            : "bg-[#211f1d] text-white"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isPending ? <LoadingSpinner /> : null}
        {isPending ? "Updating..." : label}
      </button>
      {error ? (
        <p className="mt-2 text-xs font-bold text-[#c45572]">
          Could not update @{username}: {error}
        </p>
      ) : null}
    </div>
  );
}
