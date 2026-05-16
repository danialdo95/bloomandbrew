import type { SuggestedPerson } from "@/types/social";

type SuggestedFollowsProps = {
  people: SuggestedPerson[];
  following: string[];
  onToggleFollow: (username: string) => void;
};

export function SuggestedFollows({
  people,
  following,
  onToggleFollow,
}: SuggestedFollowsProps) {
  return (
    <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <h2 className="font-black text-[#211f1d]">Suggested follows</h2>
      <div className="mt-4 space-y-4">
        {people.map((person) => {
          const isFollowing = following.includes(person.username);
          return (
            <div key={person.username} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff176] text-sm font-black">
                {person.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-[#211f1d]">{person.name}</p>
                <p className="text-xs font-bold text-[#8a7d73]">@{person.username}</p>
                <p className="mt-1 text-xs leading-5 text-[#6f6259]">{person.bio}</p>
                <button
                  type="button"
                  onClick={() => onToggleFollow(person.username)}
                  className="mt-2 rounded-full border border-[#211f1d] px-3 py-1 text-xs font-black transition hover:bg-[#211f1d] hover:text-white"
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
