import type { RedditPost } from "@/types/reddit";

type PostCardProps = {
  post: RedditPost;
  compact?: boolean;
};

export function PostCard({ post, compact = false }: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(64,45,35,0.12)]">
      <div className="relative bg-[#f8efe9]">
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt=""
            className={`${compact ? "h-52" : "h-64"} w-full object-cover transition duration-500 group-hover:scale-[1.03]`}
          />
        ) : (
          <div
            className={`${compact ? "h-52" : "h-64"} flex w-full items-center justify-center bg-[#f7d9df] px-6 text-center text-sm font-black uppercase tracking-[0.18em] text-[#211f1d]`}
          >
            Discussion
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[#fff176] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#211f1d]">
          r/{post.subreddit}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9b7d73]">
          <span>Community pick</span>
          <span>{post.score.toLocaleString()} upvotes</span>
        </div>

        <h3 className="line-clamp-3 text-lg font-black leading-snug text-[#211f1d]">
          {post.title}
        </h3>

        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#7b6f66]">
          <span>u/{post.author}</span>
          <span>{post.comments.toLocaleString()} comments</span>
        </div>

        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-[#211f1d] px-4 py-2 text-sm font-black text-[#211f1d] transition hover:bg-[#211f1d] hover:text-white"
        >
          View thread
        </a>
      </div>
    </article>
  );
}
