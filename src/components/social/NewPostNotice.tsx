type NewPostNoticeProps = {
  count: number;
  onRefresh: () => void;
};

export function NewPostNotice({ count, onRefresh }: NewPostNoticeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onRefresh}
      className="sticky top-28 z-30 mx-auto flex max-w-[calc(100vw-2rem)] items-center gap-2 whitespace-nowrap rounded-full border border-[#eadfd4] bg-[#211f1d] px-5 py-3 text-sm font-black text-white shadow-[0_16px_48px_rgba(33,31,29,0.22)] transition hover:bg-[#c45572] md:top-32"
      aria-live="polite"
    >
      <span className="h-2 w-2 rounded-full bg-[#fff176]" />
      {count === 1 ? "1 new post available" : `${count} new posts available`}
    </button>
  );
}
