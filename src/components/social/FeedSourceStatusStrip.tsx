import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import type { FeedMode, FeedSourceState, FeedSourceStatus } from "@/components/social/useFeedPosts";

type FeedSourceStatusStripProps = {
  feedMode: FeedMode;
  source: "reddit" | "fallback";
  sources: FeedSourceState;
};

export function FeedSourceStatusStrip({
  feedMode,
  source,
  sources,
}: FeedSourceStatusStripProps) {
  const items = [
    {
      label: "Bloom",
      status: sources.bloom,
      detail: feedMode === "following" ? "Following posts" : "Community posts",
    },
    {
      label: "Reddit",
      status: source === "reddit" ? sources.reddit : "fallback",
      detail: source === "reddit" ? "Live source" : "Curated source",
    },
    {
      label: "YouTube",
      status: sources.youtube,
      detail: "Video inspiration",
    },
    {
      label: "Engagement",
      status: sources.interactions,
      detail: "Saved reactions",
    },
  ];

  return (
    <div className="grid gap-2 rounded-[6px] border border-[#eadfd4] bg-white p-3 shadow-[0_8px_24px_rgba(64,45,35,0.06)] sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-[6px] bg-[#fff8f2] px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
              {item.label}
            </p>
            <p className="truncate text-sm font-black text-[#211f1d]">{item.detail}</p>
          </div>
          <FeedSourceBadge status={item.status} />
        </div>
      ))}
    </div>
  );
}

function FeedSourceBadge({ status }: { status: FeedSourceStatus }) {
  const label = getFeedSourceStatusLabel(status);
  const className =
    status === "ready"
      ? "bg-[#e7f6df] text-[#2f6336]"
      : status === "fallback"
        ? "bg-[#fff176] text-[#211f1d]"
        : status === "loading" || status === "syncing"
          ? "bg-[#f7c6cf] text-[#211f1d]"
          : status === "error"
            ? "bg-[#fbe6e1] text-[#a43f4f]"
            : "bg-white text-[#6f6259]";

  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${className}`}>
      {status === "loading" || status === "syncing" ? (
        <LoadingSpinner className="mr-1 h-3 w-3 align-[-2px]" />
      ) : null}
      {label}
    </span>
  );
}

function getFeedSourceStatusLabel(status: FeedSourceStatus) {
  const labels: Record<FeedSourceStatus, string> = {
    idle: "Idle",
    loading: "Loading",
    ready: "Live",
    fallback: "Curated",
    error: "Issue",
    syncing: "Syncing",
  };

  return labels[status];
}
