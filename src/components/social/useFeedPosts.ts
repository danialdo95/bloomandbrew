"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { seedSocialPosts } from "@/lib/social";
import type { RedditPost } from "@/types/reddit";
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
  redditSource,
  storageReady,
  youtubeSource,
}: UseFeedPostsOptions) {
  const [posts, setPosts] = useState<SocialPost[]>(() => initialExternalPosts);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isRedditLoading, setIsRedditLoading] = useState(false);
  const [isYouTubeLoading, setIsYouTubeLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
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
  const isFeedBusy = isFeedLoading || (
    feedMode === "for-you" && (isRedditLoading || isYouTubeLoading)
  );

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

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
          feed: feedMode === "following" ? "following" : "for-you",
          limit: "15",
        });
        const response = await fetch(`/api/posts?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Post fetch failed with status ${response.status}`);
        }

        const data = (await response.json()) as {
          posts: SocialPost[];
          nextCursor?: string | null;
        };

        if (!active) {
          return;
        }

        setLatestBloomPostAt(getLatestPostDate(data.posts) ?? new Date().toISOString());
        setNewPostCount(0);
        setNextCursor(data.nextCursor ?? null);

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
        if (controller.signal.aborted) return;
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
      controller.abort();
    };
  }, [
    feedMode,
    feedRefreshKey,
    followRefreshKey,
    initialExternalPosts,
    isAuthenticated,
    storageReady,
  ]);

  useEffect(() => {
    if (feedMode !== "for-you" || feedRefreshKey === 0) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    async function loadRedditPosts() {
      setIsRedditLoading(true);
      setFeedSources((current) => ({ ...current, reddit: "loading" }));

      try {
        const response = await fetch("/api/reddit", { signal: controller.signal });
        const data = (await response.json()) as {
          posts?: RedditPost[];
          source?: "reddit" | "fallback";
        };

        if (!response.ok || !data.posts?.length) throw new Error("Reddit feed unavailable.");
        if (!active) return;

        const redditPosts = seedSocialPosts(data.posts.slice(0, 12)).map((post) => ({
          ...post,
          sourceLabel: data.source === "fallback" ? "Curated Reddit inspiration" : undefined,
        }));

        setPosts((current) => {
          const databasePosts = current.filter(isDatabasePost);
          const otherPosts = current.filter(
            (post) => !isDatabasePost(post) && post.source !== "reddit",
          );
          return sortPostsByAge([...databasePosts, ...redditPosts, ...otherPosts]);
        });
        setFeedSources((current) => ({
          ...current,
          reddit: data.source === "fallback" ? "fallback" : "ready",
        }));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        if (active) setFeedSources((current) => ({ ...current, reddit: "error" }));
      } finally {
        if (active) setIsRedditLoading(false);
      }
    }

    void loadRedditPosts();
    return () => {
      active = false;
      controller.abort();
    };
  }, [feedMode, feedRefreshKey]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

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

      setIsYouTubeLoading(true);
      setFeedSources((current) => ({ ...current, youtube: "loading" }));

      try {
        const response = await fetch("/api/youtube", { signal: controller.signal });
        const data = (await response.json()) as {
          posts?: SocialPost[];
          source?: "youtube" | "fallback";
        };

        if (!response.ok || !data.posts?.length) throw new Error("YouTube feed unavailable.");
        if (!active) return;

        const youtubePosts = data.posts.slice(0, 8).map((post) => ({
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
        if (controller.signal.aborted) return;
        console.error(error);
        if (active) setFeedSources((current) => ({ ...current, youtube: "error" }));
      } finally {
        if (active) {
          setIsYouTubeLoading(false);
        }
      }
    }

    loadYouTubePosts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [feedMode, feedRefreshKey, youtubeSource]);

  async function loadMorePosts() {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({
        feed: feedMode === "following" ? "following" : "for-you",
        limit: "15",
        cursor: nextCursor,
      });
      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = (await response.json()) as {
        posts?: SocialPost[];
        nextCursor?: string | null;
        error?: string;
      };

      if (!response.ok || !data.posts) throw new Error(data.error ?? "More posts could not be loaded.");

      setPosts((current) => {
        const incomingIds = new Set(data.posts?.map((post) => post.id));
        return sortPostsByAge([
          ...current.filter((post) => !incomingIds.has(post.id)),
          ...data.posts!,
        ]);
      });
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  }

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
        setFeedSources((current) => ({ ...current, interactions: "ready" }));
      } catch (error) {
        console.error(error);
        if (active) setFeedSources((current) => ({ ...current, interactions: "error" }));
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
    hasMorePosts: Boolean(nextCursor),
    isFeedBusy,
    isLoadingMore,
    loadMorePosts,
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
