"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { SocialPost } from "@/types/social";

export type FeedMode = "for-you" | "following";
export type FeedSourceStatus = "idle" | "loading" | "ready" | "fallback" | "error" | "syncing";

export type FeedSourceState = {
  bloom: FeedSourceStatus;
  reddit: FeedSourceStatus;
  youtube: FeedSourceStatus;
  interactions: FeedSourceStatus;
};

export type ExternalPostStats = {
  likes: number;
  shares: number;
  liked: boolean;
  bookmarked: boolean;
  comments: SocialPost["comments"];
};

type UseFeedPostsOptions = {
  currentUserId?: string;
  feedMode: FeedMode;
  feedRefreshKey: number;
  followRefreshKey: number;
  initialExternalPosts: SocialPost[];
  isAuthenticated: boolean;
  profileUsername: string;
  redditSource: "reddit" | "fallback";
  storageReady: boolean;
  youtubeSource: "youtube" | "fallback";
};

export function useFeedPosts({
  currentUserId,
  feedMode,
  feedRefreshKey,
  followRefreshKey,
  initialExternalPosts,
  isAuthenticated,
  profileUsername,
  redditSource,
  storageReady,
  youtubeSource,
}: UseFeedPostsOptions) {
  const [posts, setPosts] = useState<SocialPost[]>(() => initialExternalPosts);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isExternalFeedLoading, setIsExternalFeedLoading] = useState(false);
  const [feedSources, setFeedSources] = useState<FeedSourceState>({
    bloom: "loading",
    reddit: redditSource === "reddit" ? "ready" : "fallback",
    youtube: youtubeSource === "youtube" ? "ready" : "fallback",
    interactions: "idle",
  });
  const [latestBloomPostAt, setLatestBloomPostAt] = useState<string | null>(null);
  const [newPostCount, setNewPostCount] = useState(0);
  const postsRef = useRef(posts);
  const externalPostKey = useMemo(
    () =>
      feedMode === "for-you"
        ? posts
            .filter(isExternalPost)
            .map((post) => post.id)
            .sort()
            .join("|")
        : "",
    [feedMode, posts],
  );
  const isFeedBusy = isFeedLoading || isExternalFeedLoading;

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    let active = true;

    async function loadDatabasePosts() {
      if (!storageReady) {
        return;
      }

      setIsFeedLoading(true);
      setFeedSources((current) => ({ ...current, bloom: "loading" }));

      if (feedMode === "following" && !isAuthenticated) {
        setPosts([]);
        setIsFeedLoading(false);
        setFeedSources((current) => ({ ...current, bloom: "idle" }));
        return;
      }

      try {
        const params = new URLSearchParams({
          viewer: profileUsername,
          feed: feedMode === "following" ? "following" : "for-you",
        });
        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Post fetch failed with status ${response.status}`);
        }

        const data = (await response.json()) as { posts: SocialPost[] };

        if (!active) {
          return;
        }

        setLatestBloomPostAt(getLatestPostDate(data.posts) ?? new Date().toISOString());
        setNewPostCount(0);

        setPosts((current) => {
          if (feedMode === "following") {
            return sortPostsByAge(data.posts);
          }

          const existingIds = new Set(data.posts.map((post) => post.id));
          const externalPosts = current.filter((post) => !isDatabasePost(post));
          const fallbackExternalPosts = externalPosts.length
            ? externalPosts
            : initialExternalPosts;

          return sortPostsByAge([
            ...data.posts,
            ...fallbackExternalPosts.filter((post) => !existingIds.has(post.id)),
          ]);
        });
        setFeedSources((current) => ({ ...current, bloom: "ready" }));
      } catch (error) {
        console.error(error);
        setFeedSources((current) => ({ ...current, bloom: "error" }));
      } finally {
        if (active) {
          setIsFeedLoading(false);
        }
      }
    }

    loadDatabasePosts();

    return () => {
      active = false;
    };
  }, [
    feedMode,
    feedRefreshKey,
    followRefreshKey,
    initialExternalPosts,
    isAuthenticated,
    profileUsername,
    storageReady,
  ]);

  useEffect(() => {
    let active = true;

    async function loadYouTubePosts() {
      if (feedMode !== "for-you") {
        setFeedSources((current) => ({ ...current, youtube: "idle" }));
        return;
      }

      if (feedRefreshKey === 0) {
        setFeedSources((current) => ({
          ...current,
          youtube: youtubeSource === "youtube" ? "ready" : "fallback",
        }));
        return;
      }

      setIsExternalFeedLoading(true);
      setFeedSources((current) => ({ ...current, youtube: "loading" }));

      try {
        const response = await fetch("/api/youtube");
        const data = (await response.json()) as {
          posts?: SocialPost[];
          source?: "youtube" | "fallback";
        };

        if (!active || !data.posts?.length) {
          setFeedSources((current) => ({ ...current, youtube: "error" }));
          return;
        }

        const youtubePosts = data.posts.map((post) => ({
          ...post,
          sourceLabel:
            data.source === "fallback" ? "Curated YouTube inspiration" : post.sourceLabel,
        }));

        setPosts((current) => {
          const youtubeIds = new Set(youtubePosts.map((post) => post.id));
          const databasePosts = current.filter(isDatabasePost);
          const otherPosts = current.filter(
            (post) =>
              !isDatabasePost(post) &&
              post.source !== "youtube" &&
              !youtubeIds.has(post.id),
          );

          return sortPostsByAge([...databasePosts, ...youtubePosts, ...otherPosts]);
        });
        setFeedSources((current) => ({
          ...current,
          youtube: data.source === "fallback" ? "fallback" : "ready",
        }));
      } catch (error) {
        console.error(error);
        setFeedSources((current) => ({ ...current, youtube: "error" }));
      } finally {
        if (active) {
          setIsExternalFeedLoading(false);
        }
      }
    }

    loadYouTubePosts();

    return () => {
      active = false;
    };
  }, [feedMode, feedRefreshKey, youtubeSource]);

  useEffect(() => {
    let active = true;

    async function syncExternalPosts() {
      if (!storageReady || feedMode !== "for-you" || !externalPostKey) {
        return;
      }

      const externalPosts = postsRef.current.filter(isExternalPost);
      setFeedSources((current) => ({ ...current, interactions: "syncing" }));

      try {
        const response = await fetch("/api/external-posts/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            posts: externalPosts.map(toExternalPostPayload),
          }),
        });
        const data = (await response.json()) as {
          posts?: Record<string, ExternalPostStats>;
        };

        if (!active || !response.ok || !data.posts) {
          return;
        }

        setPosts((current) =>
          current.map((post) => {
            const stats = data.posts?.[post.id];

            if (!stats || !isExternalPost(post)) {
              return post;
            }

            return {
              ...post,
              likes: post.likes - (post.persistedLikeCount ?? 0) + stats.likes,
              persistedLikeCount: stats.likes,
              shares: post.shares - (post.persistedShareCount ?? 0) + stats.shares,
              persistedShareCount: stats.shares,
              liked: stats.liked,
              bookmarked: stats.bookmarked,
              comments: [
                ...post.comments.filter((comment) => comment.system),
                ...stats.comments,
              ],
            };
          }),
        );
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setFeedSources((current) => ({ ...current, interactions: "ready" }));
        }
      }
    }

    syncExternalPosts();

    return () => {
      active = false;
    };
  }, [currentUserId, externalPostKey, feedMode, storageReady]);

  useEffect(() => {
    if (feedMode !== "for-you" || !latestBloomPostAt) {
      return;
    }

    let active = true;
    const latestPostAt = latestBloomPostAt;

    async function checkForNewPosts() {
      try {
        const params = new URLSearchParams({
          after: latestPostAt,
        });
        const response = await fetch(`/api/posts/updates?${params.toString()}`);

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          count?: number;
        };

        if (active) {
          setNewPostCount(Math.max(data.count ?? 0, 0));
        }
      } catch (error) {
        console.error(error);
      }
    }

    const intervalId = window.setInterval(() => {
      void checkForNewPosts();
    }, 45000);

    function handleFocus() {
      void checkForNewPosts();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [feedMode, latestBloomPostAt]);

  return {
    feedSources,
    isFeedBusy,
    newPostCount,
    posts,
    resetNewPostCount: () => setNewPostCount(0),
    setLatestBloomPostAt,
    setPosts,
  };
}

export function isDatabasePost(post: SocialPost) {
  return post.source === "bloom" || post.community === "Bloom & Brew";
}

export function isExternalPost(post: SocialPost) {
  return post.source === "reddit" || post.source === "youtube";
}

export function sortPostsByAge(posts: SocialPost[]) {
  return [...posts].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export function toExternalPostPayload(post: SocialPost) {
  return {
    id: post.id,
    source: post.source,
    externalUrl: post.externalUrl,
    youtubeUrl: post.youtubeUrl,
    content: post.content,
    author: post.author,
    community: post.community,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
  };
}

function getLatestPostDate(posts: SocialPost[]) {
  return posts.reduce<string | null>((latest, post) => {
    if (!isDatabasePost(post)) {
      return latest;
    }

    if (!latest || new Date(post.createdAt).getTime() > new Date(latest).getTime()) {
      return post.createdAt;
    }

    return latest;
  }, null);
}
