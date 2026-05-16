import { filterClasses, getTimeLabel } from "@/lib/social";
import type { SocialPost } from "@/types/social";

type FeedPostProps = {
  post: SocialPost;
  commentDraft: string;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onCommentDraftChange: (postId: string, value: string) => void;
  onAddComment: (postId: string) => void;
};

export function FeedPost({
  post,
  commentDraft,
  onLike,
  onShare,
  onBookmark,
  onCommentDraftChange,
  onAddComment,
}: FeedPostProps) {
  return (
    <article className="rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <div className="flex items-start gap-3 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black">
          {post.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[#211f1d]">{post.author}</h3>
            <span className="text-sm font-bold text-[#8a7d73]">@{post.username}</span>
            <span className="text-sm font-bold text-[#8a7d73]">
              · {getTimeLabel(post.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-[#c45572]">
            {post.community} · {post.location}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-[#211f1d]">
            {post.content}
          </p>
        </div>
      </div>

      {post.imageUrl ? (
        <div className="px-5 pb-4">
          <div className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-[#fff8f2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt=""
              className={`max-h-[520px] w-full object-cover ${filterClasses[post.filter]}`}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-4 border-y border-[#eadfd4] text-sm font-black text-[#6f6259]">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className="px-3 py-3 transition hover:bg-[#fff8f2]"
        >
          {post.liked ? "Liked" : "Like"} · {post.likes.toLocaleString()}
        </button>
        <button
          type="button"
          onClick={() => onShare(post.id)}
          className="px-3 py-3 transition hover:bg-[#fff8f2]"
        >
          Share · {post.shares}
        </button>
        <button
          type="button"
          onClick={() => onBookmark(post.id)}
          className="px-3 py-3 transition hover:bg-[#fff8f2]"
        >
          {post.bookmarked ? "Saved" : "Save"}
        </button>
        <span className="px-3 py-3 text-center">{post.comments.length} comments</span>
      </div>

      <div className="space-y-3 p-5">
        {post.comments.slice(-3).map((comment) => (
          <div key={comment.id} className="rounded-[6px] bg-[#fff8f2] px-4 py-3">
            <p className="text-sm font-black text-[#211f1d]">{comment.author}</p>
            <p className="mt-1 text-sm leading-6 text-[#6f6259]">{comment.text}</p>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            value={commentDraft}
            onChange={(event) => onCommentDraftChange(post.id, event.target.value)}
            placeholder="Write a comment..."
            className="h-10 flex-1 rounded-full border border-[#eadfd4] bg-[#fffaf6] px-4 text-sm font-bold"
          />
          <button
            type="button"
            onClick={() => onAddComment(post.id)}
            className="rounded-full bg-[#211f1d] px-4 text-sm font-black text-white"
          >
            Send
          </button>
        </div>
      </div>
    </article>
  );
}
