import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import type { FeedMode } from "@/components/social/useFeedPosts";

type FeedLoadingNoticeProps = {
  feedMode: FeedMode;
};

export function FeedLoadingNotice({ feedMode }: FeedLoadingNoticeProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-[6px] border border-[#eadfd4] bg-white px-5 py-4 text-sm font-black text-[#6f6259] shadow-[0_8px_24px_rgba(64,45,35,0.06)]"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner className="text-[#c45572]" />
      {feedMode === "following"
        ? "Loading your following feed..."
        : "Loading Bloom, Reddit, and YouTube posts..."}
    </div>
  );
}
