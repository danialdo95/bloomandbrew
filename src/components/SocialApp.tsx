"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AuthModal } from "@/components/social/AuthModal";
import { FeedPost } from "@/components/social/FeedPost";
import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import { PostComposer } from "@/components/social/PostComposer";
import { ProfilePanel } from "@/components/social/ProfilePanel";
import { SocialHero } from "@/components/social/SocialHero";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SuggestedFollows } from "@/components/social/SuggestedFollows";
import { useCurrentLocation as useCurrentLocationHook } from "@/components/social/useCurrentLocation";
import {
  type FeedMode,
  type FeedSourceState,
  type FeedSourceStatus,
  sortPostsByAge,
  useFeedPosts,
} from "@/components/social/useFeedPosts";
import { canDeletePost, usePostActions } from "@/components/social/usePostActions";
import { useSocialNotifications } from "@/components/social/useSocialNotifications";
import { useSocialSession } from "@/components/social/useSocialSession";
import { useSuggestedFollows } from "@/components/social/useSuggestedFollows";
import {
  seedSocialPosts,
} from "@/lib/social";
import { getTrendingKeywords } from "@/lib/trends";
import type { RedditPost } from "@/types/reddit";
import type {
  SocialPost,
} from "@/types/social";

type SocialAppProps = {
  redditPosts: RedditPost[];
  source: "reddit" | "fallback";
  youtubePosts: SocialPost[];
  youtubeSource: "youtube" | "fallback";
};

function FeedSourceStatusStrip({
  feedMode,
  source,
  sources,
}: {
  feedMode: FeedMode;
  source: "reddit" | "fallback";
  sources: FeedSourceState;
}) {
  const items = [
    {
      label: "Bloom",
      status: sources.bloom,
      detail:
        feedMode === "following"
          ? "Following posts"
          : "Community posts",
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

function FeedSkeletonList() {
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

export function SocialApp({
  redditPosts,
  source,
  youtubePosts,
  youtubeSource,
}: SocialAppProps) {
  const initialRedditPosts = useMemo(
    () => seedSocialPosts(redditPosts).map((post) => ({
      ...post,
      sourceLabel: source === "reddit" ? undefined : "Curated Reddit inspiration",
    })),
    [redditPosts, source],
  );
  const initialYouTubePosts = useMemo(
    () => youtubePosts.map((post) => ({
      ...post,
      sourceLabel:
        youtubeSource === "fallback"
          ? "Curated YouTube inspiration"
          : post.sourceLabel,
    })),
    [youtubePosts, youtubeSource],
  );
  const initialExternalPosts = useMemo(
    () => sortPostsByAge([...initialRedditPosts, ...initialYouTubePosts]),
    [initialRedditPosts, initialYouTubePosts],
  );
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [feedMode, setFeedMode] = useState<FeedMode>("for-you");
  const feedTopRef = useRef<HTMLElement | null>(null);
  const notificationHandlerRef = useRef<(message: string) => void>(() => {});

  const addNotification = useCallback((message: string) => {
    notificationHandlerRef.current(message);
  }, []);

  const resetSessionFeed = useCallback(() => {
    setFeedMode("for-you");
  }, []);

  const {
    authEmail,
    authError,
    authMode,
    authName,
    authOpen,
    authPassword,
    changeAuthMode,
    closeAuth,
    currentUser,
    disabledAccountMessage,
    dismissDisabledAccount,
    handleAuthSubmit,
    isAuthenticated,
    isAuthSubmitting,
    isSigningOut,
    openAuth,
    profile,
    requireAuth,
    setAuthEmail,
    setAuthName,
    setAuthPassword,
    setCurrentUser,
    signOut,
    storageReady,
    updateProfile,
  } = useSocialSession({
    onAuthNotice: addNotification,
    onSessionReset: resetSessionFeed,
  });

  const { addNotification: addSocialNotification } =
    useSocialNotifications(isAuthenticated);

  useEffect(() => {
    notificationHandlerRef.current = addSocialNotification;
  }, [addSocialNotification]);

  const {
    followRefreshKey,
    isSuggestionsLoading,
    pendingFollowId,
    suggestedFollows,
    toggleFollow,
  } = useSuggestedFollows({
    addNotification,
    isAuthenticated,
    requireAuth,
    setCurrentUser,
  });

  const {
    feedSources,
    isFeedBusy,
    newPostCount,
    posts,
    resetNewPostCount,
    setLatestBloomPostAt,
    setPosts,
  } = useFeedPosts({
    currentUserId: currentUser?.id,
    feedMode,
    feedRefreshKey,
    followRefreshKey,
    initialExternalPosts,
    isAuthenticated,
    profileUsername: profile.username,
    redditSource: source,
    storageReady,
    youtubeSource,
  });

  const handleFeedModeChange = useCallback(
    (mode: FeedMode) => {
      setFeedMode(mode);

      if (mode !== "for-you") {
        resetNewPostCount();
      }
    },
    [resetNewPostCount],
  );

  const {
    addComment,
    commentDrafts,
    confirmDeletePost,
    content,
    filter,
    imageUrl,
    isPublishing,
    location,
    pendingPostActions,
    postPendingDelete,
    publishPost,
    requestDeletePost,
    setCommentDrafts,
    setContent,
    setFilter,
    setImageUrl,
    setLocation,
    setPostPendingDelete,
    sharePost,
    toggleBookmark,
    toggleLike,
  } = usePostActions({
    addNotification,
    currentUser,
    posts,
    profile,
    requireAuth,
    setLatestBloomPostAt,
    setPosts,
  });

  const {
    isLocating,
    useCurrentLocation,
  } = useCurrentLocationHook({
    addNotification,
    requireAuth,
    setLocation,
  });

  const trends = useMemo(() => {
    return getTrendingKeywords(
      posts.map((post) => ({
        id: post.id,
        title: post.content,
        author: post.username,
        subreddit: post.community.replace("r/", ""),
        score: post.likes,
        comments: post.comments.length,
        url: "#",
        permalink: "#",
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
      })),
      8,
    );
  }, [posts]);

  const showFeedSkeletons = isFeedBusy;

  function refreshFeedFromNotice() {
    resetNewPostCount();
    setFeedRefreshKey((current) => current + 1);
    window.requestAnimationFrame(() => {
      feedTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    addNotification("Refreshing your feed...");
  }

  return (
    <main className="overflow-x-clip bg-[#fffaf6]">
      <SocialHero
        isAuthenticated={isAuthenticated}
        profile={profile}
        currentUser={currentUser}
        isSigningOut={isSigningOut}
        onSignIn={() => openAuth("signin")}
        onSignUp={() => openAuth("signup")}
        onSignOut={signOut}
      />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:px-5 md:py-6 lg:grid-cols-[280px_1fr_320px]">
        <aside className="order-2 space-y-5 lg:order-none">
          <ProfilePanel
            profile={profile}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onProfileChange={updateProfile}
            onCreateAccount={() => openAuth("signup")}
          />
          <SuggestedFollows
            people={suggestedFollows}
            isLoading={isSuggestionsLoading}
            pendingUserId={pendingFollowId}
            onToggleFollow={toggleFollow}
          />
        </aside>

        <section ref={feedTopRef} className="order-1 min-w-0 space-y-5 lg:order-none">
          <div className="flex items-center justify-between gap-3 rounded-[6px] border border-[#eadfd4] bg-white p-2 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <div className="grid flex-1 grid-cols-2 gap-2">
              {([
                ["for-you", "For You"],
                ["following", "Following"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleFeedModeChange(mode)}
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

          <PostComposer
            profile={profile}
            content={content}
            imageUrl={imageUrl}
            filter={filter}
            location={location}
            onContentChange={setContent}
            onImageUrlChange={setImageUrl}
            onFilterChange={setFilter}
            onLocationChange={setLocation}
            onUseCurrentLocation={useCurrentLocation}
            onPublish={() => {
              void publishPost();
            }}
            isPublishing={isPublishing}
            isLocating={isLocating}
          />

          {currentUser?.isAdmin ? (
            <FeedSourceStatusStrip
              feedMode={feedMode}
              source={source}
              sources={feedSources}
            />
          ) : null}

          {newPostCount > 0 && feedMode === "for-you" ? (
            <button
              type="button"
              onClick={refreshFeedFromNotice}
              className="sticky top-28 z-30 mx-auto flex max-w-[calc(100vw-2rem)] items-center gap-2 whitespace-nowrap rounded-full border border-[#eadfd4] bg-[#211f1d] px-5 py-3 text-sm font-black text-white shadow-[0_16px_48px_rgba(33,31,29,0.22)] transition hover:bg-[#c45572] md:top-32"
              aria-live="polite"
            >
              <span className="h-2 w-2 rounded-full bg-[#fff176]" />
              {newPostCount === 1 ? "1 new post available" : `${newPostCount} new posts available`}
            </button>
          ) : null}

          {isFeedBusy ? (
            <div
              className="flex items-center gap-3 rounded-[6px] border border-[#eadfd4] bg-white px-5 py-4 text-sm font-black text-[#6f6259] shadow-[0_8px_24px_rgba(64,45,35,0.06)]"
              aria-live="polite"
              aria-busy="true"
            >
              <LoadingSpinner className="text-[#c45572]" />
              {feedMode === "following"
                ? "Loading your following feed..."
                : "Loading Bloom, Reddit, and YouTube posts..."}
            </div>
          ) : null}

          {showFeedSkeletons ? <FeedSkeletonList /> : null}

          {!showFeedSkeletons && posts.length ? (
            posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                commentDraft={commentDrafts[post.id] ?? ""}
                pendingAction={pendingPostActions[post.id] ?? null}
                canDelete={canDeletePost(post, currentUser)}
                onLike={toggleLike}
                onShare={sharePost}
                onBookmark={(postId) => {
                  void toggleBookmark(postId);
                }}
                onDelete={(postId) => {
                  requestDeletePost(postId);
                }}
                onCommentDraftChange={(postId, value) =>
                  setCommentDrafts((current) => ({ ...current, [postId]: value }))
                }
                onAddComment={(postId) => {
                  void addComment(postId);
                }}
              />
            ))
          ) : !showFeedSkeletons ? (
            <div className="rounded-[6px] border border-dashed border-[#d8c8bc] bg-white p-8 text-center shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
              <h2 className="text-xl font-black text-[#211f1d]">
                {feedMode === "following"
                  ? isAuthenticated
                    ? "Your following feed is quiet"
                    : "Sign in to view your following feed"
                  : "No posts yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6f6259]">
                {feedMode === "following"
                  ? isAuthenticated
                    ? "Follow suggested creators or publish your own post to start the conversation."
                    : "Your personalized feed will collect posts from creators you follow."
                  : "Share the first cafe, bouquet, or latte moment."}
              </p>
              {feedMode === "following" && !isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openAuth("signin")}
                  className="mt-5 rounded-full bg-[#211f1d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c45572]"
                >
                  Sign in
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <SocialSidebar
          trends={trends}
          source={source}
        />
      </section>

      {authOpen ? (
        <AuthModal
          authMode={authMode}
          authName={authName}
          authEmail={authEmail}
          authPassword={authPassword}
          authError={authError}
          isSubmitting={isAuthSubmitting}
          onClose={closeAuth}
          onModeChange={changeAuthMode}
          onNameChange={setAuthName}
          onEmailChange={setAuthEmail}
          onPasswordChange={setAuthPassword}
          onSubmit={handleAuthSubmit}
        />
      ) : null}

      {postPendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/60 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-post-title"
          onClick={() => {
            if (!pendingPostActions[postPendingDelete.id]) {
              setPostPendingDelete(null);
            }
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_24px_80px_rgba(33,31,29,0.3)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[#f2e8df] bg-[#fffaf6] px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                Delete post
              </p>
              <h2
                id="delete-post-title"
                className="mt-2 text-2xl font-black text-[#211f1d]"
              >
                Remove this feed post?
              </h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm font-bold leading-6 text-[#6f6259]">
                This will permanently delete your Bloom & Brew post from the
                public feed. Comments, likes, saves, and shares attached to it
                will also be removed.
              </p>
              <div className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] px-4 py-3">
                <p className="line-clamp-3 text-sm font-bold leading-6 text-[#211f1d]">
                  {postPendingDelete.content}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#f2e8df] bg-[#fffaf6] px-6 py-4">
              <button
                type="button"
                onClick={() => setPostPendingDelete(null)}
                disabled={Boolean(pendingPostActions[postPendingDelete.id])}
                className="rounded-[6px] border border-[#eadfd4] bg-white px-5 py-2 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void confirmDeletePost();
                }}
                disabled={Boolean(pendingPostActions[postPendingDelete.id])}
                className="inline-flex items-center gap-2 rounded-[6px] bg-[#c45572] px-5 py-2 text-sm font-black text-white transition hover:bg-[#211f1d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingPostActions[postPendingDelete.id] === "delete" ? (
                  <LoadingSpinner className="h-3 w-3" />
                ) : null}
                {pendingPostActions[postPendingDelete.id] === "delete"
                  ? "Deleting..."
                  : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {disabledAccountMessage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/60 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disabled-account-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_24px_80px_rgba(33,31,29,0.3)]">
            <div className="border-b border-[#f2e8df] bg-[#fffaf6] px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                Account notice
              </p>
              <h2
                id="disabled-account-title"
                className="mt-2 text-2xl font-black text-[#211f1d]"
              >
                Account disabled
              </h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm font-bold leading-6 text-[#6f6259]">
                {disabledAccountMessage}
              </p>
              <p className="mt-3 rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] px-4 py-3 text-sm font-bold leading-6 text-[#6f6259]">
                You have been signed out and cannot use authenticated actions
                until an administrator reactivates the account.
              </p>
            </div>
            <div className="flex justify-end border-t border-[#f2e8df] bg-[#fffaf6] px-6 py-4">
              <button
                type="button"
                onClick={dismissDisabledAccount}
                className="rounded-[6px] bg-[#211f1d] px-5 py-2 text-sm font-black text-white transition hover:bg-[#c45572]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
