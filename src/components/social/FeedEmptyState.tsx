import type { FeedMode } from "@/components/social/useFeedPosts";

type FeedEmptyStateProps = {
  feedMode: FeedMode;
  isAuthenticated: boolean;
  onSignIn: () => void;
};

export function FeedEmptyState({
  feedMode,
  isAuthenticated,
  onSignIn,
}: FeedEmptyStateProps) {
  return (
    <div className="rounded-[6px] border border-dashed border-[#d8c8bc] bg-white p-8 text-center shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <h2 className="text-xl font-black text-[#211f1d]">
        {feedMode === "following"
          ? isAuthenticated
            ? "Your following feed is quiet"
            : "Sign in to view your following feed"
          : "No posts yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6f6259]">
        {feedMode === "following"
          ? isAuthenticated
            ? "Follow suggested creators or publish your own post to start the conversation."
            : "Your personalized feed will collect posts from creators you follow."
          : "Share the first cafe, bouquet, or latte moment."}
      </p>
      {feedMode === "following" && !isAuthenticated ? (
        <button
          type="button"
          onClick={onSignIn}
          className="mt-5 rounded-full bg-[#211f1d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c45572]"
        >
          Sign in
        </button>
      ) : null}
    </div>
  );
}
