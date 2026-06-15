"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AuthModal } from "@/components/social/AuthModal";
import { FeedPost, type FeedPostPendingAction } from "@/components/social/FeedPost";
import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import { PostComposer } from "@/components/social/PostComposer";
import { ProfilePanel } from "@/components/social/ProfilePanel";
import { SocialHero } from "@/components/social/SocialHero";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SuggestedFollows } from "@/components/social/SuggestedFollows";
import {
  defaultProfile,
  seedSocialPosts,
} from "@/lib/social";
import { getTrendingKeywords } from "@/lib/trends";
import type { RedditPost } from "@/types/reddit";
import type {
  DemoUser,
  NotificationItem,
  PostShareMethod,
  SocialPost,
  SocialProfile,
  SuggestedPerson,
} from "@/types/social";

type SocialAppProps = {
  redditPosts: RedditPost[];
  source: "reddit" | "fallback";
  youtubePosts: SocialPost[];
  youtubeSource: "youtube" | "fallback";
};

type FeedMode = "for-you" | "following";
type FeedSourceStatus = "idle" | "loading" | "ready" | "fallback" | "error" | "syncing";

type FeedSourceState = {
  bloom: FeedSourceStatus;
  reddit: FeedSourceStatus;
  youtube: FeedSourceStatus;
  interactions: FeedSourceStatus;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "welcome",
    text: "Welcome back. Your Bloom & Brew feed is ready.",
    createdAt: "Now",
  },
];

function isDatabasePost(post: SocialPost) {
  return post.source === "bloom" || post.community === "Bloom & Brew";
}

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

function isExternalPost(post: SocialPost) {
  return post.source === "reddit" || post.source === "youtube";
}

function canDeletePost(post: SocialPost, user: DemoUser | null) {
  return post.source === "bloom" && Boolean(user) && post.username === user?.profile.username;
}

function sortPostsByAge(posts: SocialPost[]) {
  return [...posts].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
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

function toExternalPostPayload(post: SocialPost) {
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

function getShareNotification(method: PostShareMethod) {
  const labels: Record<PostShareMethod, string> = {
    native: "Post shared through your device share menu.",
    copy: "Post link copied and share activity recorded.",
    facebook: "Post opened for Facebook sharing.",
    messenger: "Post opened for Messenger sharing.",
    email: "Post prepared for email sharing.",
    whatsapp: "Post opened for WhatsApp sharing.",
  };

  return labels[method];
}

type ExternalPostStats = {
  likes: number;
  shares: number;
  liked: boolean;
  bookmarked: boolean;
  comments: SocialPost["comments"];
};

type AuthMeResponse = {
  disabledAccount?: boolean;
  error?: string;
  user: DemoUser | null;
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
  const [storageReady, setStorageReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<SocialProfile>(defaultProfile);
  const [posts, setPosts] = useState<SocialPost[]>(() =>
    initialExternalPosts,
  );
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filter, setFilter] = useState("Natural");
  const [location, setLocation] = useState("Bloom & Brew Social");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [suggestedFollows, setSuggestedFollows] = useState<SuggestedPerson[]>([]);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [disabledAccountMessage, setDisabledAccountMessage] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isExternalFeedLoading, setIsExternalFeedLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [feedSources, setFeedSources] = useState<FeedSourceState>({
    bloom: "loading",
    reddit: source === "reddit" ? "ready" : "fallback",
    youtube: youtubeSource === "youtube" ? "ready" : "fallback",
    interactions: "idle",
  });
  const [latestBloomPostAt, setLatestBloomPostAt] = useState<string | null>(null);
  const [newPostCount, setNewPostCount] = useState(0);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);
  const [pendingPostActions, setPendingPostActions] = useState<
    Record<string, Exclude<FeedPostPendingAction, null>>
  >({});
  const [feedMode, setFeedMode] = useState<FeedMode>("for-you");
  const [followRefreshKey, setFollowRefreshKey] = useState(0);
  const postsRef = useRef(posts);
  const feedTopRef = useRef<HTMLElement | null>(null);

  const isAuthenticated = Boolean(currentUser);
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

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  function setPostPending(postId: string, action: Exclude<FeedPostPendingAction, null>) {
    setPendingPostActions((current) => ({ ...current, [postId]: action }));
  }

  function clearPostPending(postId: string) {
    setPendingPostActions((current) => {
      const next = { ...current };
      delete next[postId];
      return next;
    });
  }

  function handleDisabledAccount(message: string) {
    setCurrentUser(null);
    setProfile(defaultProfile);
    setFeedMode("for-you");
    setAuthOpen(false);
    setAuthError("");
    setDisabledAccountMessage(message);
  }

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me");
        const data = (await response.json()) as AuthMeResponse;

        if (data.user) {
          setCurrentUser(data.user);
          setProfile(data.user.profile);
        } else if (data.disabledAccount) {
          handleDisabledAccount(
            data.error ?? "Your account has been disabled. Please contact an administrator.",
          );
        }
      } catch (error) {
        console.error(error);
      }

      setStorageReady(true);
    }

    loadSession();
  }, []);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("authError");

    if (!authError) {
      return;
    }

    setAuthMode("signin");
    setAuthOpen(true);
    setAuthError(authError);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("authError");
    window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch("/api/auth/me");
        const data = (await response.json()) as AuthMeResponse;

        if (data.disabledAccount) {
          handleDisabledAccount(
            data.error ?? "Your account has been disabled. Please contact an administrator.",
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    window.addEventListener("focus", verifySession);

    return () => {
      window.removeEventListener("focus", verifySession);
    };
  }, [currentUser]);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      if (!isAuthenticated) {
        setNotifications(initialNotifications);
        return;
      }

      try {
        const response = await fetch("/api/notifications");
        const data = (await response.json()) as {
          notifications?: NotificationItem[];
        };

        if (active && response.ok) {
          setNotifications(data.notifications?.length ? data.notifications : initialNotifications);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

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
          viewer: profile.username,
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
    profile.username,
    storageReady,
  ]);

  useEffect(() => {
    let active = true;

    async function loadSuggestedFollows() {
      if (!isAuthenticated) {
        setSuggestedFollows([]);
        setIsSuggestionsLoading(false);
        return;
      }

      setIsSuggestionsLoading(true);

      try {
        const response = await fetch("/api/users/suggestions");
        const data = (await response.json()) as { people?: SuggestedPerson[] };

        if (active) {
          setSuggestedFollows(data.people ?? []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setIsSuggestionsLoading(false);
        }
      }
    }

    loadSuggestedFollows();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

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
  }, [currentUser?.id, externalPostKey, feedMode, storageReady]);

  useEffect(() => {
    if (feedMode !== "for-you" || !latestBloomPostAt) {
      setNewPostCount(0);
      return;
    }

    let active = true;

    async function checkForNewPosts() {
      try {
        const params = new URLSearchParams({
          after: latestBloomPostAt as string,
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

  const isFeedBusy = isFeedLoading || isExternalFeedLoading;
  const showFeedSkeletons = isFeedBusy && posts.length <= initialExternalPosts.length;

  function addNotification(text: string) {
    const optimisticNotification = {
      id: crypto.randomUUID(),
      text,
      createdAt: "Now",
    };

    setNotifications((current) => [
      optimisticNotification,
      ...current.slice(0, 19),
    ]);

    if (!isAuthenticated) {
      return;
    }

    void fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          notification?: NotificationItem;
        };

        if (!response.ok || !data.notification) {
          return;
        }

        setNotifications((current) =>
          current.map((notification) =>
            notification.id === optimisticNotification.id
              ? data.notification as NotificationItem
              : notification,
          ),
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function refreshFeedFromNotice() {
    setNewPostCount(0);
    setFeedRefreshKey((current) => current + 1);
    window.requestAnimationFrame(() => {
      feedTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    addNotification("Feed refreshed.");
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("bloom-notifications", {
        detail: notifications,
      }),
    );
  }, [notifications]);

  function openAuth(mode: "signin" | "signup") {
    setAuthMode(mode);
    setAuthError("");
    setAuthOpen(true);
  }

  function requireAuth(action: string) {
    if (isAuthenticated) {
      return true;
    }

    setAuthError(`Please sign in or create an account to ${action}.`);
    openAuth("signin");
    return false;
  }

  function clearAuthForm() {
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
  }

  function handleAuthSubmit() {
    if (isAuthSubmitting) {
      return;
    }

    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();
    const name = authName.trim();

    if (!email || !password || (authMode === "signup" && !name)) {
      setAuthError("Fill in all required fields.");
      return;
    }

    if (authMode === "signup") {
      void signUp(email, password, name);
      return;
    }

    void signIn(email, password);
  }

  async function signUp(email: string, password: string, name: string) {
    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });
      const data = (await response.json()) as { user?: DemoUser; error?: string };

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Account could not be created.");
      }

      setCurrentUser(data.user);
      setProfile(data.user.profile);
      setAuthOpen(false);
      clearAuthForm();
      addNotification("Account created. Welcome to Bloom & Brew Social.");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Account could not be created.",
      );
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function signIn(email: string, password: string) {
    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { user?: DemoUser; error?: string };

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Invalid email or password.");
      }

      setCurrentUser(data.user);
      setProfile(data.user.profile);
      setAuthOpen(false);
      clearAuthForm();
      addNotification("Signed in successfully.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Invalid email or password.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function signOut() {
    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setCurrentUser(null);
      setProfile(defaultProfile);
      setFeedMode("for-you");
      addNotification("Signed out of your account.");
    } finally {
      setIsSigningOut(false);
    }
  }

  async function updateProfile(nextProfile: SocialProfile) {
    if (!currentUser) {
      throw new Error("Sign in to edit your profile.");
    }

    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextProfile),
    });
    const data = (await response.json()) as { user?: DemoUser; error?: string };

    if (!response.ok || !data.user) {
      throw new Error(data.error ?? "Profile could not be saved.");
    }

    setCurrentUser(data.user);
    setProfile(data.user.profile);
    addNotification("Profile saved.");
  }

  async function publishPost() {
    if (!requireAuth("share posts")) {
      return;
    }

    if (!content.trim() && !imageUrl.trim()) {
      return;
    }

    setIsPublishing(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          imageUrl,
          filter,
          location,
          profile,
        }),
      });

      const data = (await response.json()) as { post?: SocialPost; error?: string };

      if (!response.ok || !data.post) {
        throw new Error(data.error ?? "Post could not be shared.");
      }

      setPosts((current) => sortPostsByAge([
        data.post as SocialPost,
        ...current.filter((post) => post.id !== data.post?.id),
      ]));
      setLatestBloomPostAt((data.post as SocialPost).createdAt);
      setContent("");
      setImageUrl("");
      setFilter("Natural");
      addNotification("Your post was shared to the Bloom & Brew feed.");
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Post could not be shared.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function toggleLike(postId: string) {
    if (!requireAuth("like posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;
    setPostPending(postId, "like");

    if (isPostInDatabase) {
      try {
        const response = await fetch(`/api/posts/${postId}/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile,
          }),
        });
        const data = (await response.json()) as {
          liked?: boolean;
          likes?: number;
          error?: string;
        };

        if (!response.ok || typeof data.liked !== "boolean" || typeof data.likes !== "number") {
          throw new Error(data.error ?? "Like could not be recorded.");
        }

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  liked: data.liked as boolean,
                  likes: data.likes as number,
                }
              : post,
          ),
        );
        addNotification(data.liked ? "Post liked." : "Post unliked.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Like could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    if (targetPost && isExternalPost(targetPost)) {
      try {
        const response = await fetch(`/api/external-posts/${postId}/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post: toExternalPostPayload(targetPost),
          }),
        });
        const data = (await response.json()) as Partial<ExternalPostStats> & {
          error?: string;
        };

        if (!response.ok || typeof data.liked !== "boolean" || typeof data.likes !== "number") {
          throw new Error(data.error ?? "Like could not be recorded.");
        }

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.likes - (post.persistedLikeCount ?? 0) + (data.likes as number),
                  persistedLikeCount: data.likes as number,
                  liked: data.liked as boolean,
                }
              : post,
          ),
        );
        addNotification(data.liked ? "Post liked." : "Post unliked.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Like could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
    addNotification("A feed interaction was recorded.");
    clearPostPending(postId);
  }

  async function toggleBookmark(postId: string) {
    if (!requireAuth("save posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;
    setPostPending(postId, "bookmark");

    if (isPostInDatabase) {
      try {
        const response = await fetch(`/api/posts/${postId}/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile,
          }),
        });
        const data = (await response.json()) as {
          bookmarked?: boolean;
          error?: string;
        };

        if (!response.ok || typeof data.bookmarked !== "boolean") {
          throw new Error(data.error ?? "Save could not be recorded.");
        }

        const bookmarked = data.bookmarked;

        setPosts((current) =>
          current.map((post) =>
            post.id === postId ? { ...post, bookmarked } : post,
          ),
        );
        addNotification(bookmarked ? "Post saved." : "Post removed from saved.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Save could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    if (targetPost && isExternalPost(targetPost)) {
      try {
        const response = await fetch(`/api/external-posts/${postId}/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post: toExternalPostPayload(targetPost),
          }),
        });
        const data = (await response.json()) as Partial<ExternalPostStats> & {
          error?: string;
        };

        if (!response.ok || typeof data.bookmarked !== "boolean") {
          throw new Error(data.error ?? "Save could not be recorded.");
        }

        setPosts((current) =>
          current.map((post) =>
            post.id === postId ? { ...post, bookmarked: data.bookmarked as boolean } : post,
          ),
        );
        addNotification(data.bookmarked ? "Post saved." : "Post removed from saved.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Save could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
      ),
    );
    clearPostPending(postId);
  }

  async function sharePost(postId: string, method: PostShareMethod = "copy") {
    if (!requireAuth("share posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    const endpoint = isExternalPost(targetPost)
      ? `/api/external-posts/${postId}/shares`
      : `/api/posts/${postId}/shares`;

    setPostPending(postId, "share");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isExternalPost(targetPost)
            ? {
                post: toExternalPostPayload(targetPost),
              }
            : {},
        ),
      });
      const data = (await response.json()) as {
        shares?: number;
        error?: string;
      };

      if (!response.ok || typeof data.shares !== "number") {
        throw new Error(data.error ?? "Share could not be recorded.");
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                shares: isExternalPost(post)
                  ? post.shares - (post.persistedShareCount ?? 0) + (data.shares as number)
                  : data.shares as number,
                persistedShareCount: isExternalPost(post)
                  ? data.shares as number
                  : post.persistedShareCount,
              }
            : post,
        ),
      );
      addNotification(getShareNotification(method));
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Share could not be recorded.",
      );
    } finally {
      clearPostPending(postId);
    }
  }

  async function addComment(postId: string) {
    if (!requireAuth("comment")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const text = commentDrafts[postId]?.trim();

    if (!text) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;
    setPostPending(postId, "comment");

    if (isPostInDatabase) {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            profile,
          }),
        });
        const data = (await response.json()) as {
          comment?: SocialPost["comments"][number];
          error?: string;
        };

        if (!response.ok || !data.comment) {
          throw new Error(data.error ?? "Comment could not be added.");
        }

        const savedComment = data.comment;

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, savedComment],
                }
              : post,
          ),
        );
        setCommentDrafts((current) => ({ ...current, [postId]: "" }));
        addNotification("Your comment was saved to the database.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Comment could not be added.",
        );
        clearPostPending(postId);
        return;
      }
    }

    if (targetPost && isExternalPost(targetPost)) {
      try {
        const response = await fetch(`/api/external-posts/${postId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            post: toExternalPostPayload(targetPost),
          }),
        });
        const data = (await response.json()) as {
          comment?: SocialPost["comments"][number];
          error?: string;
        };

        if (!response.ok || !data.comment) {
          throw new Error(data.error ?? "Comment could not be added.");
        }

        const savedComment = data.comment;

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, savedComment],
                }
              : post,
          ),
        );
        setCommentDrafts((current) => ({ ...current, [postId]: "" }));
        addNotification("Your comment was saved to the database.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Comment could not be added.",
        );
        clearPostPending(postId);
        return;
      }
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: crypto.randomUUID(),
                  author: profile.name,
                  text,
                },
              ],
            }
          : post,
      ),
    );
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    addNotification("Your comment was added.");
    clearPostPending(postId);
  }

  async function deletePost(postId: string) {
    if (!requireAuth("delete posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost || !canDeletePost(targetPost, currentUser)) {
      addNotification("You can only delete your own Bloom & Brew posts.");
      return;
    }

    const confirmed = window.confirm("Delete this post?");

    if (!confirmed) {
      return;
    }

    setPostPending(postId, "delete");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };

      if (!response.ok || !data.deleted) {
        throw new Error(data.error ?? "Post could not be deleted.");
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
      addNotification("Post deleted.");
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Post could not be deleted.",
      );
    } finally {
      clearPostPending(postId);
    }
  }

  async function toggleFollow(person: SuggestedPerson) {
    if (!requireAuth("follow creators")) {
      return;
    }

    if (!person.id) {
      addNotification("This suggested creator is not available yet.");
      return;
    }

    if (pendingFollowId) {
      return;
    }

    setPendingFollowId(person.id);

    try {
      const response = await fetch(`/api/users/${person.id}/follow`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        isFollowing?: boolean;
        username?: string;
        error?: string;
      };

      if (!response.ok || typeof data.isFollowing !== "boolean") {
        throw new Error(data.error ?? "Follow status could not be updated.");
      }

      setSuggestedFollows((current) =>
        current.map((item) =>
          item.id === person.id ? { ...item, isFollowing: data.isFollowing } : item,
        ),
      );
      setCurrentUser((user) => {
        if (!user) {
          return user;
        }

        const currentFollowing = user.stats?.following ?? 0;

        return {
          ...user,
          stats: {
            followers: user.stats?.followers ?? 0,
            following: data.isFollowing
              ? currentFollowing + 1
              : Math.max(currentFollowing - 1, 0),
          },
        };
      });
      setFollowRefreshKey((current) => current + 1);
      addNotification(
        data.isFollowing
          ? `You are now following @${data.username ?? person.username}.`
          : `You unfollowed @${data.username ?? person.username}.`,
      );
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Follow status could not be updated.",
      );
    } finally {
      setPendingFollowId(null);
    }
  }

  function useCurrentLocation() {
    if (!requireAuth("tag your location")) {
      return;
    }

    if (isLocating) {
      return;
    }

    if (!navigator.geolocation) {
      addNotification("Geolocation is not available in this browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
        setLocation(nextLocation);
        addNotification("Location tag updated.");
        setIsLocating(false);
      },
      () => {
        addNotification("Location permission was not granted.");
        setIsLocating(false);
      },
    );
  }

  return (
    <main className="bg-[#fffaf6]">
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

        <section ref={feedTopRef} className="order-1 space-y-5 lg:order-none">
          <div className="flex items-center justify-between gap-3 rounded-[6px] border border-[#eadfd4] bg-white p-2 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <div className="grid flex-1 grid-cols-2 gap-2">
              {([
                ["for-you", "For You"],
                ["following", "Following"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFeedMode(mode)}
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
              className="sticky top-28 z-30 mx-auto flex items-center gap-2 rounded-full border border-[#eadfd4] bg-[#211f1d] px-5 py-3 text-sm font-black text-white shadow-[0_16px_48px_rgba(33,31,29,0.22)] transition hover:bg-[#c45572] md:top-32"
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
                : "Refreshing Bloom, Reddit, and YouTube posts..."}
            </div>
          ) : null}

          {showFeedSkeletons ? <FeedSkeletonList /> : null}

          {posts.length ? (
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
                  void deletePost(postId);
                }}
                onCommentDraftChange={(postId, value) =>
                  setCommentDrafts((current) => ({ ...current, [postId]: value }))
                }
                onAddComment={(postId) => {
                  void addComment(postId);
                }}
              />
            ))
          ) : (
            <div className="rounded-[6px] border border-dashed border-[#d8c8bc] bg-white p-8 text-center shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
              <h2 className="text-xl font-black text-[#211f1d]">
                {feedMode === "following" ? "Build your following feed" : "No posts yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6f6259]">
                {feedMode === "following"
                  ? "Follow suggested creators or publish your own post to make this feed bloom."
                  : "Share the first cafe, bouquet, or latte moment."}
              </p>
            </div>
          )}
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
          onClose={() => {
            if (isAuthSubmitting) {
              return;
            }
            setAuthOpen(false);
            setAuthError("");
          }}
          onModeChange={(mode) => {
            setAuthMode(mode);
            setAuthError("");
          }}
          onNameChange={setAuthName}
          onEmailChange={setAuthEmail}
          onPasswordChange={setAuthPassword}
          onSubmit={handleAuthSubmit}
        />
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
                onClick={() => setDisabledAccountMessage("")}
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
