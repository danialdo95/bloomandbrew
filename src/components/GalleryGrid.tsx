import type { RedditPost } from "@/types/reddit";

type GalleryGridProps = {
  posts: RedditPost[];
};

export function GalleryGrid({ posts }: GalleryGridProps) {
  const imagePosts = posts.filter((post) => post.imageUrl).slice(0, 8);

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
      {imagePosts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="mb-4 block break-inside-avoid overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(64,45,35,0.12)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl ?? ""} alt="" className="w-full object-cover" />
          <div className="space-y-2 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c45572]">
              r/{post.subreddit}
            </p>
            <h3 className="text-sm font-black leading-snug text-[#211f1d]">
              {post.title}
            </h3>
          </div>
        </a>
      ))}
    </div>
  );
}
