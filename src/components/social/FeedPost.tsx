import Link from "next/link";

import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import { filterClasses, filterStyles, getTimeLabel } from "@/lib/social";
import type { SocialPost } from "@/types/social";

export type FeedPostPendingAction = "like" | "share" | "bookmark" | "comment" | null;

type FeedPostProps = {
  post: SocialPost;
  commentDraft: string;
  pendingAction?: FeedPostPendingAction;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onCommentDraftChange: (postId: string, value: string) => void;
  onAddComment: (postId: string) => void;
};

export function FeedPost({
  post,
  commentDraft,
  pendingAction = null,
  onLike,
  onShare,
  onBookmark,
  onCommentDraftChange,
  onAddComment,
}: FeedPostProps) {
  const userCommentCount = post.comments.filter((comment) => !comment.system).length;
  const commentCount =
    post.source === "reddit" || post.source === "youtube"
      ? (post.externalCommentCount ?? 0) + userCommentCount
      : post.comments.length;
  const isBloomPost = post.source === "bloom";
  const profileHref = `/users/${post.username}`;
  const isBusy = Boolean(pendingAction);

  return (
    <article className="rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <div className="flex items-start gap-3 p-5">
        {isBloomPost ? (
          <Link
            href={profileHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black"
            aria-label={`View ${post.author}'s profile`}
          >
            {post.avatar}
          </Link>
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black">
            {post.avatar}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isBloomPost ? (
              <Link href={profileHref} className="font-black text-[#211f1d] hover:underline">
                {post.author}
              </Link>
            ) : (
              <h3 className="font-black text-[#211f1d]">{post.author}</h3>
            )}
            <span className="text-sm font-bold text-[#8a7d73]">@{post.username}</span>
            <span className="text-sm font-bold text-[#8a7d73]">
              · {getTimeLabel(post.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-[#c45572]">
            {post.source === "reddit" && post.externalUrl ? (
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {post.community}
              </a>
            ) : (
              <span>{post.community}</span>
            )}{" "}
            · {post.location}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-[#211f1d]">
            {post.content}
          </p>
        </div>
      </div>

      {post.youtubeVideoId ? (
        <div className="px-5 pb-4">
          <div className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-[#211f1d]">
            <iframe
              className="aspect-video w-full"
              src={`https://www.youtube.com/embed/${post.youtubeVideoId}?autoplay=0&rel=0`}
              title={post.content}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          {post.youtubeChannel ? (
            <a
              href={post.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-sm font-black text-[#c45572] hover:underline"
            >
              Watch on YouTube · {post.youtubeChannel}
            </a>
          ) : null}
        </div>
      ) : post.imageUrl ? (
        <div className="px-5 pb-4">
          <div className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-[#fff8f2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt=""
              className={`max-h-[520px] w-full object-cover ${filterClasses[post.filter]}`}
              style={filterStyles[post.filter] ?? filterStyles.Natural}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-4 border-y border-[#eadfd4] text-sm font-black text-[#6f6259]">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 px-3 py-3 transition hover:bg-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "like" ? <LoadingSpinner className="h-3 w-3" /> : null}
          {pendingAction === "like"
            ? "Updating..."
            : `${post.liked ? "Liked" : "Like"} · ${post.likes.toLocaleString()}`}
        </button>
        <button
          type="button"
          onClick={() => onShare(post.id)}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 px-3 py-3 transition hover:bg-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "share" ? <LoadingSpinner className="h-3 w-3" /> : null}
          {pendingAction === "share" ? "Sharing..." : `Share · ${post.shares}`}
        </button>
        <button
          type="button"
          onClick={() => onBookmark(post.id)}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 px-3 py-3 transition hover:bg-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "bookmark" ? <LoadingSpinner className="h-3 w-3" /> : null}
          {pendingAction === "bookmark"
            ? "Saving..."
            : post.bookmarked
              ? "Saved"
              : "Save"}
        </button>
        <span className="px-3 py-3 text-center">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
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
            disabled={pendingAction === "comment"}
            className="h-10 flex-1 rounded-full border border-[#eadfd4] bg-[#fffaf6] px-4 text-sm font-bold"
          />
          <button
            type="button"
            onClick={() => onAddComment(post.id)}
            disabled={isBusy || !commentDraft.trim()}
            className="flex min-w-20 items-center justify-center gap-2 rounded-full bg-[#211f1d] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "comment" ? <LoadingSpinner className="h-3 w-3" /> : null}
            {pendingAction === "comment" ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </article>
  );
}
