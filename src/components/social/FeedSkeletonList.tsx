export function FeedSkeletonList() {
  return (
    <div className="space-y-5" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <article
          key={index}
          className="animate-pulse rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]"
        >
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-full bg-[#f7c6cf]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-2/5 rounded-full bg-[#eadfd4]" />
              <div className="h-3 w-1/3 rounded-full bg-[#f3e8df]" />
              <div className="space-y-2 pt-2">
                <div className="h-3 rounded-full bg-[#f3e8df]" />
                <div className="h-3 w-5/6 rounded-full bg-[#f3e8df]" />
              </div>
            </div>
          </div>
          <div className="mt-4 aspect-video rounded-[6px] bg-[#fff8f2]" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, buttonIndex) => (
              <div key={buttonIndex} className="h-9 rounded-full bg-[#f3e8df]" />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
