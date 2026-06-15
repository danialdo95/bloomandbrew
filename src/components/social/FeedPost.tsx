"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const commentInputRef = useRef<HTMLInputElement | null>(null);
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
  const sourceBadge = getPostSourceBadge(post);
  const contentCanCollapse = post.content.length > 260;
  const visibleContent = contentCanCollapse && !contentExpanded
    ? `${post.content.slice(0, 260).trimEnd()}...`
    : post.content;

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

    setShareModalOpen(false);

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

    if (method === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
      onShare(post.id, method);
      return;
    }

    if (method === "messenger") {
      window.open(
        `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
          shareUrl,
        )}&redirect_uri=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
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
    <article className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(64,45,35,0.1)]">
      <div className="flex items-start gap-3 px-4 pb-4 pt-5 sm:px-5">
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${sourceBadge.className}`}
            >
              {sourceBadge.label}
            </span>
          </div>
          <p className="mt-1.5 text-xs font-bold leading-5 text-[#8a7d73] sm:text-sm">
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
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[#211f1d] sm:text-base">
            {visibleContent}
          </p>
          {contentCanCollapse ? (
            <button
              type="button"
              onClick={() => setContentExpanded((current) => !current)}
              className="mt-2 text-sm font-black text-[#c45572] transition hover:text-[#211f1d]"
              aria-expanded={contentExpanded}
            >
              {contentExpanded ? "Show less" : "Read more"}
            </button>
          ) : null}
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
        <div className="px-4 pb-4 sm:px-5">
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
        <div className="px-4 pb-4 sm:px-5">
          <div className="aspect-[4/3] overflow-hidden rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] sm:aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt=""
              className={`h-full w-full object-cover ${filterClasses[post.filter]}`}
              style={filterStyles[post.filter] ?? filterStyles.Natural}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-4 border-y border-[#eadfd4] bg-[#fffdfb] px-1 text-[#6f6259] sm:px-3">
        <PostActionButton
          label={post.liked ? "Unlike" : "Like"}
          count={post.likes}
          icon={post.liked ? "♥" : "♡"}
          active={post.liked}
          loading={pendingAction === "like"}
          disabled={isBusy}
          onClick={() => onLike(post.id)}
        />
        <PostActionButton
          label="Share"
          count={post.shares}
          icon="↗"
          loading={pendingAction === "share"}
          disabled={isBusy}
          onClick={() => setShareModalOpen(true)}
        />
        <PostActionButton
          label={post.bookmarked ? "Remove saved post" : "Save"}
          icon={<BookmarkIcon filled={post.bookmarked} />}
          active={post.bookmarked}
          loading={pendingAction === "bookmark"}
          disabled={isBusy}
          onClick={() => onBookmark(post.id)}
        />
        <PostActionButton
          label="Comment"
          count={commentCount}
          icon={<MessageBubbleIcon />}
          disabled={isBusy}
          onClick={() => commentInputRef.current?.focus()}
        />
      </div>

      {shareModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Share post"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-[6px] border border-[#eadfd4] bg-white px-5 py-6 shadow-[0_24px_80px_rgba(64,45,35,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                  Share post
                </p>
                <h2 className="mt-1 text-xl font-black text-[#211f1d]">
                  Send this Bloom & Brew moment
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd4] bg-[#fff8f2] text-lg font-black text-[#211f1d] transition hover:border-[#c45572]"
                aria-label="Close share dialog"
              >
                ×
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <ShareModalButton
                label="Copy link"
                icon={<LinkIcon />}
                onClick={() => void handleShare("copy")}
              />
              <ShareModalButton
                label="Facebook"
                icon={<FacebookIcon />}
                onClick={() => void handleShare("facebook")}
              />
              <ShareModalButton
                label="Messenger"
                icon={<MessengerIcon />}
                onClick={() => void handleShare("messenger")}
              />
              <ShareModalButton
                label="WhatsApp"
                icon={<WhatsAppIcon />}
                onClick={() => void handleShare("whatsapp")}
              />
              <ShareModalButton
                label="Email"
                icon={<EmailIcon />}
                onClick={() => void handleShare("email")}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleShare("native")}
              className="mt-6 w-full rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] px-4 py-3 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:bg-white"
            >
              Use device share sheet
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
        {post.comments.slice(-3).map((comment) => (
          <div key={comment.id} className="rounded-[6px] bg-[#fff8f2] px-4 py-3">
            <p className="text-sm font-black text-[#211f1d]">{comment.author}</p>
            <p className="mt-1 text-sm leading-6 text-[#6f6259]">{comment.text}</p>
          </div>
        ))}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={commentInputRef}
            value={commentDraft}
            onChange={(event) => onCommentDraftChange(post.id, event.target.value)}
            placeholder="Write a comment..."
            disabled={pendingAction === "comment"}
            className="h-11 min-w-0 flex-1 rounded-full border border-[#eadfd4] bg-[#fffaf6] px-4 text-sm font-bold outline-none transition focus:border-[#c45572] focus:bg-white"
          />
          <button
            type="button"
            onClick={() => onAddComment(post.id)}
            disabled={isBusy || !commentDraft.trim()}
            className="flex h-11 min-w-20 items-center justify-center gap-2 rounded-full bg-[#211f1d] px-5 text-sm font-black text-white transition hover:bg-[#c45572] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "comment" ? <LoadingSpinner className="h-3 w-3" /> : null}
            {pendingAction === "comment" ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </article>
  );
}

function PostActionButton({
  label,
  count,
  icon,
  active = false,
  loading = false,
  disabled = false,
  onClick,
}: {
  label: string;
  count?: number;
  icon: ReactNode;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const countLabel = typeof count === "number" ? count.toLocaleString() : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={countLabel ? `${label}, ${countLabel}` : label}
      className={`flex h-14 min-w-0 items-center justify-center gap-1.5 rounded-[6px] px-1 text-xs font-black transition sm:gap-2 sm:px-3 sm:text-sm ${
        active
          ? "text-[#c45572]"
          : "text-[#6f6259] hover:bg-[#fff8f2] hover:text-[#211f1d]"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {loading ? (
        <LoadingSpinner className="h-4 w-4 shrink-0" />
      ) : (
        <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center text-lg leading-none [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </span>
      )}
      {countLabel ? <span className="truncate tabular-nums">{countLabel}</span> : null}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path
        d="M7 4.75A1.75 1.75 0 0 1 8.75 3h6.5A1.75 1.75 0 0 1 17 4.75V21l-5-3.2L7 21V4.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 18.25 3.75 21l3.8-1.2A8.8 8.8 0 1 0 5 18.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareModalButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 text-[#211f1d]"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#eadfd4] bg-[#f7c6cf] text-[#211f1d] shadow-[0_8px_24px_rgba(64,45,35,0.08)] transition group-hover:border-[#c45572] group-hover:bg-[#fff176] sm:h-20 sm:w-20 [&>svg]:h-8 [&>svg]:w-8 [&>svg]:shrink-0">
        {icon}
      </span>
      <span className="text-sm font-black sm:text-base">{label}</span>
    </button>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.6 13.4a1.5 1.5 0 0 1 0-2.1l2.6-2.6a3.1 3.1 0 0 1 4.4 4.4l-2 2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M13.4 10.6a1.5 1.5 0 0 1 0 2.1l-2.6 2.6a3.1 3.1 0 0 1-4.4-4.4l2-2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.1 19v-6h2l.4-2.6h-2.4V8.7c0-.7.3-1.2 1.3-1.2h1.2V5.1c-.6-.1-1.2-.2-1.9-.2-2.2 0-3.7 1.3-3.7 3.7v1.8H7.7V13H10v6h3.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 11.7C4 7.5 7.5 4.3 12 4.3s8 3.2 8 7.4-3.5 7.4-8 7.4c-.8 0-1.6-.1-2.3-.4L6.5 20v-3.1A7.2 7.2 0 0 1 4 11.7Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m7.6 13.5 2.7-2.9 2.1 2 3.9-2.7-3 3.4-2.1-2.1-3.6 2.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.3 19.1 6.4 16A7.7 7.7 0 1 1 9 18.4l-3.7.7Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.1 8.2c-.2-.3-.3-.3-.6-.3h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.2.2 2 3.1 4.8 4.1 2.4.8 2.8.7 3.4.6.5 0 1.6-.6 1.9-1.3.2-.6.2-1.2.1-1.3 0-.1-.3-.2-.6-.4l-1.7-.8c-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.5-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4.5"
        y="6.5"
        width="15"
        height="11"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="m5.3 7.4 6.7 5.4 6.7-5.4"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
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

function getPostSourceBadge(post: SocialPost) {
  if (post.sourceLabel?.toLowerCase().includes("curated")) {
    return {
      label: "Curated",
      className: "bg-[#fff176] text-[#211f1d]",
    };
  }

  if (post.source === "youtube") {
    return {
      label: "YouTube",
      className: "bg-[#fbe6e1] text-[#a43f4f]",
    };
  }

  if (post.source === "reddit") {
    return {
      label: "Reddit",
      className: "bg-[#e7f6df] text-[#2f6336]",
    };
  }

  return {
    label: "Bloom",
    className: "bg-[#f7c6cf] text-[#211f1d]",
  };
}
