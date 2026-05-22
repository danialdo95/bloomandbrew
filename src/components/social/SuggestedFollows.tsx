import Link from "next/link";

import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import type { SuggestedPerson } from "@/types/social";

type SuggestedFollowsProps = {
  people: SuggestedPerson[];
  isLoading?: boolean;
  pendingUserId?: string | null;
  onToggleFollow: (person: SuggestedPerson) => void;
};

export function SuggestedFollows({
  people,
  isLoading = false,
  pendingUserId = null,
  onToggleFollow,
}: SuggestedFollowsProps) {
  return (
    <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <h2 className="font-black text-[#211f1d]">Suggested follows</h2>
      <div className="mt-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-[6px] bg-[#fff8f2] p-3 text-sm font-bold text-[#6f6259]">
            <LoadingSpinner className="text-[#c45572]" />
            Loading people to follow...
          </div>
        ) : people.length ? (
          people.map((person) => {
            const isFollowing = Boolean(person.isFollowing);
            const isPending = pendingUserId === person.id;
            return (
              <div key={person.username} className="flex items-start gap-3">
                <Link
                  href={`/users/${person.username}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff176] text-sm font-black"
                  aria-label={`View ${person.name}'s profile`}
                >
                  {person.avatar}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/users/${person.username}`}
                    className="font-black text-[#211f1d] hover:underline"
                  >
                    {person.name}
                  </Link>
                  <p className="text-xs font-bold text-[#8a7d73]">@{person.username}</p>
                  <p className="mt-1 text-xs leading-5 text-[#6f6259]">{person.bio}</p>
                  <button
                    type="button"
                    onClick={() => onToggleFollow(person)}
                    disabled={isPending}
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#211f1d] px-3 py-1 text-xs font-black transition hover:bg-[#211f1d] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? <LoadingSpinner className="h-3 w-3" /> : null}
                    {isPending ? "Updating..." : isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-[6px] bg-[#fff8f2] p-3 text-sm font-bold leading-6 text-[#6f6259]">
            Sign in to see people you can follow.
          </p>
        )}
      </div>
    </section>
  );
}
