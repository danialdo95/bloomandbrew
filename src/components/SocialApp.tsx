"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AuthModal } from "@/components/social/AuthModal";
import { DeletePostModal } from "@/components/social/DeletePostModal";
import { DisabledAccountModal } from "@/components/social/DisabledAccountModal";
import { FeedEmptyState } from "@/components/social/FeedEmptyState";
import { FeedLoadingNotice } from "@/components/social/FeedLoadingNotice";
import { FeedModeTabs } from "@/components/social/FeedModeTabs";
import { FeedPost } from "@/components/social/FeedPost";
import { FeedSkeletonList } from "@/components/social/FeedSkeletonList";
import { FeedSourceStatusStrip } from "@/components/social/FeedSourceStatusStrip";
import { NewPostNotice } from "@/components/social/NewPostNotice";
import { PostComposer } from "@/components/social/PostComposer";
import { ProfilePanel } from "@/components/social/ProfilePanel";
import { SocialHero } from "@/components/social/SocialHero";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SuggestedFollows } from "@/components/social/SuggestedFollows";
import { useCurrentLocation as useCurrentLocationHook } from "@/components/social/useCurrentLocation";
import {
  type FeedMode,
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
          <FeedModeTabs feedMode={feedMode} onModeChange={handleFeedModeChange} />

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

          {feedMode === "for-you" ? (
            <NewPostNotice count={newPostCount} onRefresh={refreshFeedFromNotice} />
          ) : null}

          {isFeedBusy ? <FeedLoadingNotice feedMode={feedMode} /> : null}

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
            <FeedEmptyState
              feedMode={feedMode}
              isAuthenticated={isAuthenticated}
              onSignIn={() => openAuth("signin")}
            />
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
        <DeletePostModal
          post={postPendingDelete}
          pendingAction={pendingPostActions[postPendingDelete.id] ?? null}
          onCancel={() => setPostPendingDelete(null)}
          onConfirm={() => {
            void confirmDeletePost();
          }}
        />
      ) : null}

      {disabledAccountMessage ? (
        <DisabledAccountModal
          message={disabledAccountMessage}
          onDismiss={dismissDisabledAccount}
        />
      ) : null}
    </main>
  );
}
