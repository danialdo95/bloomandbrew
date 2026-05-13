"use client";

import { useEffect, useMemo, useState } from "react";

import { TrendTags } from "@/components/TrendTags";
import { getTrendingKeywords } from "@/lib/trends";
import type { RedditPost } from "@/types/reddit";

type SocialProfile = {
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
};

type SocialComment = {
  id: string;
  author: string;
  text: string;
};

type SocialPost = {
  id: string;
  author: string;
  username: string;
  avatar: string;
  community: string;
  content: string;
  imageUrl: string | null;
  filter: string;
  location: string;
  createdAt: string;
  likes: number;
  shares: number;
  comments: SocialComment[];
  liked: boolean;
  bookmarked: boolean;
};

type NotificationItem = {
  id: string;
  text: string;
  createdAt: string;
};

type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
};

type DemoUser = {
  id: string;
  email: string;
  password: string;
  profile: SocialProfile;
};

type SocialAppProps = {
  redditPosts: RedditPost[];
  source: "reddit" | "fallback";
};

const defaultProfile: SocialProfile = {
  name: "Bloom Barista",
  username: "bloombarista",
  bio: "Finding the soft spot between latte art, flowers, and slow cafe moments.",
  location: "Kuala Lumpur",
  avatar: "BB",
};

const suggestedPeople = [
  {
    name: "Petal Notes",
    username: "petalnotes",
    bio: "Bouquet styling and seasonal color palettes.",
    avatar: "PN",
  },
  {
    name: "Slow Bar Daily",
    username: "slowbar",
    bio: "Cafe interiors, espresso bars, and quiet corners.",
    avatar: "SB",
  },
  {
    name: "Latte Story",
    username: "lattestory",
    bio: "Daily latte art practice and milk texture experiments.",
    avatar: "LS",
  },
];

const filterClasses: Record<string, string> = {
  Natural: "",
  Blush: "saturate-125 sepia-[0.12]",
  Cream: "brightness-105 contrast-90",
  Vintage: "sepia-[0.35] contrast-95",
};

function seedSocialPosts(posts: RedditPost[]): SocialPost[] {
  return posts.slice(0, 8).map((post, index) => ({
    id: post.id,
    author: post.author,
    username: post.author.toLowerCase().replace(/[^a-z0-9_]/g, "") || "reddit_user",
    avatar: post.author.slice(0, 2).toUpperCase(),
    community: `r/${post.subreddit}`,
    content: post.title,
    imageUrl: post.imageUrl,
    filter: "Natural",
    location: index % 2 === 0 ? "Community feed" : "Reddit inspiration",
    createdAt: post.createdAt,
    likes: post.score,
    shares: Math.max(Math.round(post.comments / 3), 3),
    comments: [
      {
        id: `${post.id}-comment`,
        author: "Bloom & Brew",
        text: `${post.comments.toLocaleString()} Reddit comments are part of this conversation.`,
      },
    ],
    liked: false,
    bookmarked: false,
  }));
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getTimeLabel(date: string) {
  const timestamp = new Date(date).getTime();
  const diff = Date.now() - timestamp;
  const hours = Math.max(Math.round(diff / 1000 / 60 / 60), 1);

  if (hours > 48) {
    return `${Math.round(hours / 24)}d`;
  }

  return `${hours}h`;
}

export function SocialApp({ redditPosts, source }: SocialAppProps) {
  const [users, setUsers] = useState<DemoUser[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedUsers = window.localStorage.getItem("bloom-brew-users");
    return storedUsers ? (JSON.parse(storedUsers) as DemoUser[]) : [];
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("bloom-brew-current-user");
  });
  const [profile, setProfile] = useState<SocialProfile>(() => {
    if (typeof window === "undefined") {
      return defaultProfile;
    }

    const storedProfile = window.localStorage.getItem("bloom-brew-profile");
    return storedProfile ? (JSON.parse(storedProfile) as SocialProfile) : defaultProfile;
  });
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    if (typeof window === "undefined") {
      return seedSocialPosts(redditPosts);
    }

    const storedPosts = window.localStorage.getItem("bloom-brew-social-posts");
    return storedPosts ? (JSON.parse(storedPosts) as SocialPost[]) : seedSocialPosts(redditPosts);
  });
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filter, setFilter] = useState("Natural");
  const [location, setLocation] = useState("Bloom & Brew Social");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [following, setFollowing] = useState<string[]>(["petalnotes"]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "welcome",
      text: "Welcome back. Your Bloom & Brew feed is ready.",
      createdAt: "Now",
    },
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
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
  ]);
  const [chatDraft, setChatDraft] = useState("");
  const [live, setLive] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const isAuthenticated = Boolean(currentUser);

  useEffect(() => {
    window.localStorage.setItem("bloom-brew-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      window.localStorage.setItem("bloom-brew-current-user", currentUserId);
      return;
    }

    window.localStorage.removeItem("bloom-brew-current-user");
  }, [currentUserId]);

  useEffect(() => {
    window.localStorage.setItem("bloom-brew-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem("bloom-brew-social-posts", JSON.stringify(posts));
  }, [posts]);

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
    setNotifications((current) => [
      {
        id: crypto.randomUUID(),
        text,
        createdAt: "Now",
      },
      ...current.slice(0, 5),
    ]);
  }

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

  function handleAuthSubmit() {
    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();
    const name = authName.trim();

    if (!email || !password || (authMode === "signup" && !name)) {
      setAuthError("Fill in all required fields.");
      return;
    }

    if (authMode === "signup") {
      if (users.some((user) => user.email === email)) {
        setAuthError("An account with this email already exists.");
        return;
      }

      const nextProfile: SocialProfile = {
        name,
        username: email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase(),
        bio: "New to Bloom & Brew Social.",
        location: "Kuala Lumpur",
        avatar: getInitials(name) || "BB",
      };
      const nextUser: DemoUser = {
        id: crypto.randomUUID(),
        email,
        password,
        profile: nextProfile,
      };

      setUsers((current) => [...current, nextUser]);
      setCurrentUserId(nextUser.id);
      setProfile(nextProfile);
      setAuthOpen(false);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
      addNotification("Account created. Welcome to Bloom & Brew Social.");
      return;
    }

    const user = users.find(
      (storedUser) => storedUser.email === email && storedUser.password === password,
    );

    if (!user) {
      setAuthError("Invalid email or password.");
      return;
    }

    setCurrentUserId(user.id);
    setProfile(user.profile);
    setAuthOpen(false);
    setAuthEmail("");
    setAuthPassword("");
    addNotification("Signed in successfully.");
  }

  function signOut() {
    setCurrentUserId(null);
    setProfile(defaultProfile);
    addNotification("Signed out of the demo account.");
  }

  function updateProfile(nextProfile: SocialProfile) {
    setProfile(nextProfile);

    if (!currentUserId) {
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === currentUserId ? { ...user, profile: nextProfile } : user,
      ),
    );
  }

  function publishPost() {
    if (!requireAuth("share posts")) {
      return;
    }

    if (!content.trim() && !imageUrl.trim()) {
      return;
    }

    const nextPost: SocialPost = {
      id: crypto.randomUUID(),
      author: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      community: "Bloom & Brew",
      content: content.trim() || "Shared a new Bloom & Brew moment.",
      imageUrl: imageUrl.trim() || null,
      filter,
      location,
      createdAt: new Date().toISOString(),
      likes: 0,
      shares: 0,
      comments: [],
      liked: false,
      bookmarked: false,
    };

    setPosts((current) => [nextPost, ...current]);
    setContent("");
    setImageUrl("");
    setFilter("Natural");
    addNotification("Your post was shared to the Bloom & Brew feed.");
  }

  function toggleLike(postId: string) {
    if (!requireAuth("like posts")) {
      return;
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

  function toggleBookmark(postId: string) {
    if (!requireAuth("save posts")) {
      return;
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
      ),
    );
  }

  function sharePost(postId: string) {
    if (!requireAuth("share posts")) {
      return;
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post,
      ),
    );
    addNotification("Post shared with your community.");
  }

  function addComment(postId: string) {
    if (!requireAuth("comment")) {
      return;
    }

    const text = commentDrafts[postId]?.trim();

    if (!text) {
      return;
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

  function toggleFollow(username: string) {
    if (!requireAuth("follow creators")) {
      return;
    }

    setFollowing((current) => {
      const isFollowing = current.includes(username);
      return isFollowing
        ? current.filter((item) => item !== username)
        : [...current, username];
    });
    addNotification(`Updated follow status for @${username}.`);
  }

  function requestBrowserNotification() {
    if (!requireAuth("enable notifications")) {
      return;
    }

    if (!("Notification" in window)) {
      addNotification("Browser notifications are not supported here.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Bloom & Brew Social", {
          body: "Notifications are enabled for this demo.",
        });
      }
      addNotification(`Notification permission: ${permission}.`);
    });
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

  return (
    <main className="bg-[#fffaf6]">
      <section className="border-b border-[#eadfd4] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#c45572]">
            Social media mode
          </p>
          <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight text-[#211f1d] md:text-6xl">
                Bloom & Brew is now a social feed for cafe and floral culture.
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6f6259]">
                Create posts, personalize a profile, follow creators, react,
                comment, share, chat, go live, tag locations, and browse a
                Reddit-powered news feed.
              </p>
            </div>

            <div className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] p-4">
              {isAuthenticated ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                    Signed in as
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#211f1d]">
                    {profile.name}
                  </p>
                  <p className="text-sm font-bold text-[#8a7d73]">@{profile.username}</p>
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-4 rounded-full border border-[#211f1d] px-4 py-2 text-sm font-black text-[#211f1d] transition hover:bg-[#211f1d] hover:text-white"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                    Join the social feed
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#6f6259]">
                    Sign in or create a demo account to post, comment, follow,
                    chat, save, and go live.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openAuth("signin")}
                      className="rounded-full bg-[#211f1d] px-4 py-2 text-sm font-black text-white"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuth("signup")}
                      className="rounded-full border border-[#211f1d] bg-white px-4 py-2 text-sm font-black text-[#211f1d]"
                    >
                      Sign up
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[280px_1fr_320px]">
        <aside className="space-y-5">
          <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7c6cf] text-lg font-black text-[#211f1d]">
                {profile.avatar}
              </div>
              <div>
                <h2 className="font-black text-[#211f1d]">{profile.name}</h2>
                <p className="text-sm font-bold text-[#8a7d73]">@{profile.username}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#6f6259]">{profile.bio}</p>
            <p className="mt-3 text-sm font-bold text-[#c45572]">📍 {profile.location}</p>
            <div className="mt-4 rounded-[6px] bg-[#fff8f2] p-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c45572]">
                Account status
              </p>
              <p className="mt-1 text-sm font-bold text-[#211f1d]">
                {isAuthenticated ? `Signed in with ${currentUser?.email}` : "Guest mode"}
              </p>
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="mt-3 rounded-full bg-[#211f1d] px-4 py-2 text-xs font-black text-white"
                >
                  Create account
                </button>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              <input
                value={profile.name}
                onChange={(event) =>
                  updateProfile({
                    ...profile,
                    name: event.target.value,
                    avatar: getInitials(event.target.value) || profile.avatar,
                  })
                }
                className="h-10 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
                aria-label="Display name"
              />
              <input
                value={profile.username}
                onChange={(event) =>
                  updateProfile({
                    ...profile,
                    username: event.target.value.replace(/\s+/g, "").toLowerCase(),
                  })
                }
                className="h-10 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
                aria-label="Username"
              />
              <textarea
                value={profile.bio}
                onChange={(event) =>
                  updateProfile({ ...profile, bio: event.target.value })
                }
                className="min-h-20 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 py-2 text-sm font-bold"
                aria-label="Profile bio"
              />
            </div>
          </section>

          <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <h2 className="font-black text-[#211f1d]">Suggested follows</h2>
            <div className="mt-4 space-y-4">
              {suggestedPeople.map((person) => {
                const isFollowing = following.includes(person.username);
                return (
                  <div key={person.username} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff176] text-sm font-black">
                      {person.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-[#211f1d]">{person.name}</p>
                      <p className="text-xs font-bold text-[#8a7d73]">@{person.username}</p>
                      <p className="mt-1 text-xs leading-5 text-[#6f6259]">{person.bio}</p>
                      <button
                        type="button"
                        onClick={() => toggleFollow(person.username)}
                        className="mt-2 rounded-full border border-[#211f1d] px-3 py-1 text-xs font-black transition hover:bg-[#211f1d] hover:text-white"
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black">
                {profile.avatar}
              </div>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Share a cafe visit, bouquet idea, latte art moment..."
                  className="min-h-24 w-full resize-none rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#211f1d]"
                />
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="Image URL"
                    className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
                  />
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
                  >
                    {Object.keys(filterClasses).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Location"
                    className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
                  />
                </div>

                {imageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-[6px] border border-[#eadfd4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt=""
                      className={`max-h-64 w-full object-cover ${filterClasses[filter]}`}
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      className="rounded-full bg-[#fff8f2] px-3 py-2 text-xs font-black text-[#211f1d]"
                    >
                      Tag location
                    </button>
                    <button
                      type="button"
                      onClick={requestBrowserNotification}
                      className="rounded-full bg-[#fff8f2] px-3 py-2 text-xs font-black text-[#211f1d]"
                    >
                      Enable notifications
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={publishPost}
                    className="rounded-full bg-[#211f1d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c45572]"
                  >
                    Share post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]"
            >
              <div className="flex items-start gap-3 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black">
                  {post.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-[#211f1d]">{post.author}</h3>
                    <span className="text-sm font-bold text-[#8a7d73]">@{post.username}</span>
                    <span className="text-sm font-bold text-[#8a7d73]">· {getTimeLabel(post.createdAt)}</span>
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
                  onClick={() => toggleLike(post.id)}
                  className="px-3 py-3 transition hover:bg-[#fff8f2]"
                >
                  {post.liked ? "Liked" : "Like"} · {post.likes.toLocaleString()}
                </button>
                <button
                  type="button"
                  onClick={() => sharePost(post.id)}
                  className="px-3 py-3 transition hover:bg-[#fff8f2]"
                >
                  Share · {post.shares}
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmark(post.id)}
                  className="px-3 py-3 transition hover:bg-[#fff8f2]"
                >
                  {post.bookmarked ? "Saved" : "Save"}
                </button>
                <span className="px-3 py-3 text-center">
                  {post.comments.length} comments
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
                    value={commentDrafts[post.id] ?? ""}
                    onChange={(event) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [post.id]: event.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="h-10 flex-1 rounded-full border border-[#eadfd4] bg-[#fffaf6] px-4 text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => addComment(post.id)}
                    className="rounded-full bg-[#211f1d] px-4 text-sm font-black text-white"
                  >
                    Send
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-5">
          <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-[#211f1d]">Notifications</h2>
              <span className="rounded-full bg-[#fff176] px-2 py-1 text-xs font-black">
                {notifications.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className="rounded-[6px] bg-[#fff8f2] p-3">
                  <p className="text-sm font-bold leading-6 text-[#211f1d]">{item.text}</p>
                  <p className="mt-1 text-xs font-bold text-[#8a7d73]">{item.createdAt}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <h2 className="font-black text-[#211f1d]">In-app chat</h2>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-[6px] px-3 py-2 text-sm font-bold leading-6 ${
                    message.from === "me"
                      ? "ml-8 bg-[#211f1d] text-white"
                      : "mr-8 bg-[#fff8f2] text-[#211f1d]"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder="Message..."
                className="h-10 min-w-0 flex-1 rounded-full border border-[#eadfd4] bg-[#fffaf6] px-4 text-sm font-bold"
              />
              <button
                type="button"
                onClick={sendChat}
                className="rounded-full bg-[#c45572] px-4 text-sm font-black text-white"
              >
                Send
              </button>
            </div>
          </section>

          <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-[#211f1d]">Live room</h2>
                <p className="mt-1 text-sm font-bold text-[#6f6259]">
                  Stream a bouquet build or cafe visit.
                </p>
              </div>
              <span
                className={`h-3 w-3 rounded-full ${live ? "bg-red-500" : "bg-[#d8c8bc]"}`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setLive((current) => !current);
                addNotification(live ? "Live room ended." : "Live room started.");
              }}
              className="mt-4 w-full rounded-full bg-[#211f1d] px-4 py-3 text-sm font-black text-white"
            >
              {live ? "End live" : "Start live"}
            </button>
          </section>

          <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <h2 className="font-black text-[#211f1d]">Trending now</h2>
            <div className="mt-4">
              <TrendTags trends={trends} />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#8a7d73]">
              Source: {source === "reddit" ? "Live Reddit feed" : "Fallback demo feed"}
            </p>
          </section>
        </aside>
      </section>

      {authOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/60 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          <div className="w-full max-w-md rounded-[8px] border border-[#eadfd4] bg-white p-6 shadow-[0_24px_80px_rgba(33,31,29,0.3)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                  Bloom & Brew account
                </p>
                <h2 id="auth-title" className="mt-2 text-3xl font-black text-[#211f1d]">
                  {authMode === "signin" ? "Sign in" : "Create account"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthOpen(false);
                  setAuthError("");
                }}
                className="rounded-full px-3 py-1 text-2xl font-black text-[#6f6259] hover:bg-[#fff8f2]"
                aria-label="Close auth modal"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-full bg-[#fff8f2] p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                }}
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  authMode === "signin" ? "bg-[#211f1d] text-white" : "text-[#211f1d]"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  authMode === "signup" ? "bg-[#211f1d] text-white" : "text-[#211f1d]"
                }`}
              >
                Sign up
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleAuthSubmit();
              }}
            >
              {authMode === "signup" ? (
                <label className="block">
                  <span className="text-sm font-black text-[#211f1d]">Display name</span>
                  <input
                    value={authName}
                    onChange={(event) => setAuthName(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
                    placeholder="Bloom Barista"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="text-sm font-black text-[#211f1d]">Email</span>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  className="mt-2 h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#211f1d]">Password</span>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  className="mt-2 h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
                  placeholder="Demo password"
                />
              </label>

              {authError ? (
                <p className="rounded-[6px] bg-[#fff8f2] px-3 py-2 text-sm font-bold text-[#c45572]">
                  {authError}
                </p>
              ) : null}

              <button
                type="submit"
                className="h-12 w-full rounded-full bg-[#211f1d] text-sm font-black text-white transition hover:bg-[#c45572]"
              >
                {authMode === "signin" ? "Sign in" : "Create account"}
              </button>

              <p className="text-center text-xs font-bold leading-5 text-[#8a7d73]">
                Demo auth stores account data in this browser only. It is for
                assignment functionality, not production security.
              </p>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
