import type { FeedMode } from "@/components/social/useFeedPosts";

type FeedModeTabsProps = {
  feedMode: FeedMode;
  onModeChange: (mode: FeedMode) => void;
};

export function FeedModeTabs({ feedMode, onModeChange }: FeedModeTabsProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[6px] border border-[#eadfd4] bg-white p-2 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <div className="grid flex-1 grid-cols-2 gap-2">
        {([
          ["for-you", "For You"],
          ["following", "Following"],
        ] as const).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onModeChange(mode)}
            className={`h-11 rounded-[6px] text-sm font-black transition ${
              feedMode === mode
                ? "bg-[#211f1d] text-white"
                : "bg-[#fff8f2] text-[#6f6259] hover:text-[#211f1d]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
