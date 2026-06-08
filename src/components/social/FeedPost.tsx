"use client";

import Link from "next/link";
import { useState } from "react";

import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import { filterClasses, filterStyles, getTimeLabel } from "@/lib/social";
import type { PostShareMethod, SocialPost } from "@/types/social";

export type FeedPostPendingAction =
  | "like"
  | "share"
  | "bookmark"
  | "comment"
  | "delete"
  | null;

type FeedPostProps = {
  post: SocialPost;
  commentDraft: string;
  pendingAction?: FeedPostPendingAction;
  canDelete?: boolean;
  onLike: (postId: string) => void;
  onShare: (postId: string, method?: PostShareMethod) => void;
  onBookmark: (postId: string) => void;
  onDelete: (postId: string) => void;
  onCommentDraftChange: (postId: string, value: string) => void;
  onAddComment: (postId: string) => void;
};

export function FeedPost({
  post,
  commentDraft,
  pendingAction = null,
  canDelete = false,
  onLike,
  onShare,
  onBookmark,
  onDelete,
  onCommentDraftChange,
  onAddComment,
}: FeedPostProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const userCommentCount = post.comments.filter((comment) => !comment.system).length;
  const commentCount =
    post.source === "reddit" || post.source === "youtube"
      ? (post.externalCommentCount ?? 0) + userCommentCount
      : post.comments.length;
  const isBloomPost = post.source === "bloom";
  const profileHref = `/users/${post.username}`;
  const isBusy = Boolean(pendingAction);
  const shareUrl = getShareUrl(post);
  const shareText = `${post.content}\n\n${shareUrl}`;

  async function copyShareLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = shareUrl;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  async function handleShare(method: PostShareMethod) {
    if (isBusy) {
      return;
    }

    if (method === "native") {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: "Bloom & Brew Social",
            text: post.content,
            url: shareUrl,
          });
          onShare(post.id, method);
        } catch {
          // User cancelled the native share sheet.
        }
      } else {
        await copyShareLink();
        onShare(post.id, "copy");
      }
      return;
    }

    if (method === "copy") {
      await copyShareLink();
      onShare(post.id, method);
      return;
    }

    if (method === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        "Bloom & Brew Social post",
      )}&body=${encodeURIComponent(shareText)}`;
      onShare(post.id, method);
      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onShare(post.id, method);
  }

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
        {canDelete ? (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              disabled={isBusy}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-black text-[#6f6259] transition hover:bg-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Open post options"
              aria-expanded={menuOpen}
            >
              ...
            </button>
            {menuOpen ? (
              <div className="absolute right-0 z-10 mt-2 w-36 rounded-[6px] border border-[#eadfd4] bg-white p-1 shadow-[0_12px_32px_rgba(33,31,29,0.16)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(post.id);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-[6px] px-3 py-2 text-sm font-black text-[#c45572] transition hover:bg-[#fff8f2]"
                >
                  {pendingAction === "delete" ? (
                    <LoadingSpinner className="h-3 w-3" />
                  ) : null}
                  {pendingAction === "delete" ? "Deleting..." : "Delete post"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
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
        <details className={`relative ${isBusy ? "pointer-events-none opacity-60" : ""}`}>
          <summary className="flex h-full w-full cursor-pointer list-none items-center justify-center gap-2 px-3 py-3 transition hover:bg-[#fff8f2] marker:hidden">
            {pendingAction === "share" ? <LoadingSpinner className="h-3 w-3" /> : null}
            {pendingAction === "share" ? "Sharing..." : `Share · ${post.shares}`}
          </summary>
          <div className="absolute left-1/2 z-10 mt-2 w-48 -translate-x-1/2 rounded-[6px] border border-[#eadfd4] bg-white p-1 text-left shadow-[0_12px_32px_rgba(33,31,29,0.16)]">
            <button
              type="button"
              onClick={() => void handleShare("native")}
              className="block w-full rounded-[6px] px-3 py-2 text-left text-sm font-black text-[#211f1d] hover:bg-[#fff8f2]"
            >
              Share with device
            </button>
            <button
              type="button"
              onClick={() => void handleShare("copy")}
              className="block w-full rounded-[6px] px-3 py-2 text-left text-sm font-black text-[#211f1d] hover:bg-[#fff8f2]"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => void handleShare("email")}
              className="block w-full rounded-[6px] px-3 py-2 text-left text-sm font-black text-[#211f1d] hover:bg-[#fff8f2]"
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => void handleShare("whatsapp")}
              className="block w-full rounded-[6px] px-3 py-2 text-left text-sm font-black text-[#211f1d] hover:bg-[#fff8f2]"
            >
              WhatsApp
            </button>
          </div>
        </details>
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

function getShareUrl(post: SocialPost) {
  if (post.youtubeUrl) {
    return post.youtubeUrl;
  }

  if (post.externalUrl) {
    return post.externalUrl;
  }

  if (typeof window === "undefined") {
    return `/users/${post.username}`;
  }

  return `${window.location.origin}/users/${post.username}#${post.id}`;
}
