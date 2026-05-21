"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AuthModal } from "@/components/social/AuthModal";
import { FeedPost } from "@/components/social/FeedPost";
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
  ChatMessage,
  DemoUser,
  NotificationItem,
  SocialPost,
  SocialProfile,
  SuggestedPerson,
} from "@/types/social";

type SocialAppProps = {
  redditPosts: RedditPost[];
  source: "reddit" | "fallback";
};

type FeedMode = "for-you" | "following";

const initialNotifications: NotificationItem[] = [
  {
    id: "welcome",
    text: "Welcome back. Your Bloom & Brew feed is ready.",
    createdAt: "Now",
  },
];

const initialChatMessages: ChatMessage[] = [
  {
    id: "chat-1",
    from: "them",
    text: "Do you prefer the blush bouquet board or cafe corner board today?",
  },
  {
    id: "chat-2",
    from: "me",
    text: "Blush bouquet first, then coffee pairings.",
  },
];

function isDatabasePost(post: SocialPost) {
  return post.source === "bloom" || post.community === "Bloom & Brew";
}

function isExternalPost(post: SocialPost) {
  return post.source === "reddit" || post.source === "youtube";
}

function sortPostsByAge(posts: SocialPost[]) {
  return [...posts].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
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

type ExternalPostStats = {
  likes: number;
  shares: number;
  liked: boolean;
  bookmarked: boolean;
  comments: SocialPost["comments"];
};

export function SocialApp({ redditPosts, source }: SocialAppProps) {
  const [storageReady, setStorageReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<SocialProfile>(defaultProfile);
  const [posts, setPosts] = useState<SocialPost[]>(() =>
    sortPostsByAge(seedSocialPosts(redditPosts)),
  );
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filter, setFilter] = useState("Natural");
  const [location, setLocation] = useState("Bloom & Brew Social");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [suggestedFollows, setSuggestedFollows] = useState<SuggestedPerson[]>([]);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(initialChatMessages);
  const [chatDraft, setChatDraft] = useState("");
  const [live, setLive] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedMode, setFeedMode] = useState<FeedMode>("for-you");
  const [followRefreshKey, setFollowRefreshKey] = useState(0);
  const postsRef = useRef(posts);

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

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me");
        const data = (await response.json()) as { user: DemoUser | null };

        if (data.user) {
          setCurrentUser(data.user);
          setProfile(data.user.profile);
        }
      } catch (error) {
        console.error(error);
      }

      setStorageReady(true);
    }

    loadSession();
  }, []);

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

      if (feedMode === "following" && !isAuthenticated) {
        setPosts([]);
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

        setPosts((current) => {
          if (feedMode === "following") {
            return sortPostsByAge(data.posts);
          }

          const existingIds = new Set(data.posts.map((post) => post.id));
          const externalPosts = current.filter((post) => !isDatabasePost(post));
          const fallbackExternalPosts = externalPosts.length
            ? externalPosts
            : seedSocialPosts(redditPosts);

          return sortPostsByAge([
            ...data.posts,
            ...fallbackExternalPosts.filter((post) => !existingIds.has(post.id)),
          ]);
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadDatabasePosts();

    return () => {
      active = false;
    };
  }, [feedMode, followRefreshKey, isAuthenticated, profile.username, redditPosts, storageReady]);

  useEffect(() => {
    let active = true;

    async function loadSuggestedFollows() {
      if (!isAuthenticated) {
        setSuggestedFollows([]);
        return;
      }

      try {
        const response = await fetch("/api/users/suggestions");
        const data = (await response.json()) as { people?: SuggestedPerson[] };

        if (active) {
          setSuggestedFollows(data.people ?? []);
        }
      } catch (error) {
        console.error(error);
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
        return;
      }

      try {
        const response = await fetch("/api/youtube");
        const data = (await response.json()) as { posts?: SocialPost[] };

        if (!active || !data.posts?.length) {
          return;
        }

        const youtubePosts = data.posts;

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
      } catch (error) {
        console.error(error);
      }
    }

    loadYouTubePosts();

    return () => {
      active = false;
    };
  }, [feedMode]);

  useEffect(() => {
    let active = true;

    async function syncExternalPosts() {
      if (!storageReady || feedMode !== "for-you" || !externalPostKey) {
        return;
      }

      const externalPosts = postsRef.current.filter(isExternalPost);

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
      }
    }

    syncExternalPosts();

    return () => {
      active = false;
    };
  }, [currentUser?.id, externalPostKey, feedMode, storageReady]);

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
    }
  }

  async function signIn(email: string, password: string) {
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
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setCurrentUser(null);
    setProfile(defaultProfile);
    setFeedMode("for-you");
    addNotification("Signed out of your account.");
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

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;

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
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Like could not be recorded.",
        );
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
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Like could not be recorded.",
        );
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
  }

  async function toggleBookmark(postId: string) {
    if (!requireAuth("save posts")) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;

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
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Save could not be recorded.",
        );
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
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Save could not be recorded.",
        );
        return;
      }
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
      ),
    );
  }

  async function sharePost(postId: string) {
    if (!requireAuth("share posts")) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    const endpoint = isExternalPost(targetPost)
      ? `/api/external-posts/${postId}/shares`
      : `/api/posts/${postId}/shares`;

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
      addNotification("Post shared with your community.");
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Share could not be recorded.",
      );
    }
  }

  async function addComment(postId: string) {
    if (!requireAuth("comment")) {
      return;
    }

    const text = commentDrafts[postId]?.trim();

    if (!text) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;

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
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Comment could not be added.",
        );
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
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Comment could not be added.",
        );
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
  }

  async function toggleFollow(person: SuggestedPerson) {
    if (!requireAuth("follow creators")) {
      return;
    }

    if (!person.id) {
      addNotification("This suggested creator is not available yet.");
      return;
    }

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
    }
  }

  function useCurrentLocation() {
    if (!requireAuth("tag your location")) {
      return;
    }

    if (!navigator.geolocation) {
      addNotification("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
        setLocation(nextLocation);
        addNotification("Location tag updated.");
      },
      () => addNotification("Location permission was not granted."),
    );
  }

  function sendChat() {
    if (!requireAuth("send chat messages")) {
      return;
    }

    if (!chatDraft.trim()) {
      return;
    }

    setChatMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        from: "me",
        text: chatDraft.trim(),
      },
    ]);
    setChatDraft("");
  }

  function toggleLive() {
    if (!requireAuth("start a live room")) {
      return;
    }

    setLive((current) => !current);
    addNotification(live ? "Live room ended." : "Live room started.");
  }

  return (
    <main className="bg-[#fffaf6]">
      <SocialHero
        isAuthenticated={isAuthenticated}
        profile={profile}
        currentUser={currentUser}
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
            onToggleFollow={toggleFollow}
          />
        </aside>

        <section className="order-1 space-y-5 lg:order-none">
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
          />

          {posts.length ? (
            posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                commentDraft={commentDrafts[post.id] ?? ""}
                onLike={toggleLike}
                onShare={sharePost}
                onBookmark={(postId) => {
                  void toggleBookmark(postId);
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
          chatMessages={chatMessages}
          chatDraft={chatDraft}
          live={live}
          trends={trends}
          source={source}
          onChatDraftChange={setChatDraft}
          onSendChat={sendChat}
          onToggleLive={toggleLive}
        />
      </section>

      {authOpen ? (
        <AuthModal
          authMode={authMode}
          authName={authName}
          authEmail={authEmail}
          authPassword={authPassword}
          authError={authError}
          onClose={() => {
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
    </main>
  );
}
