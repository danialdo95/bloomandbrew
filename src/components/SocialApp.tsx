"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthModal } from "@/components/social/AuthModal";
import { FeedPost } from "@/components/social/FeedPost";
import { PostComposer } from "@/components/social/PostComposer";
import { ProfilePanel } from "@/components/social/ProfilePanel";
import { SocialHero } from "@/components/social/SocialHero";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SuggestedFollows } from "@/components/social/SuggestedFollows";
import {
  defaultProfile,
  getInitials,
  seedSocialPosts,
  suggestedPeople,
} from "@/lib/social";
import { getTrendingKeywords } from "@/lib/trends";
import type { RedditPost } from "@/types/reddit";
import type {
  ChatMessage,
  DemoUser,
  NotificationItem,
  SocialPost,
  SocialProfile,
} from "@/types/social";

type SocialAppProps = {
  redditPosts: RedditPost[];
  source: "reddit" | "fallback";
};

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

export function SocialApp({ redditPosts, source }: SocialAppProps) {
  const [storageReady, setStorageReady] = useState(false);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<SocialProfile>(defaultProfile);
  const [posts, setPosts] = useState<SocialPost[]>(() => seedSocialPosts(redditPosts));
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filter, setFilter] = useState("Natural");
  const [location, setLocation] = useState("Bloom & Brew Social");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [following, setFollowing] = useState<string[]>(["petalnotes"]);
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

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const isAuthenticated = Boolean(currentUser);

  useEffect(() => {
    window.setTimeout(() => {
      const storedUsers = window.localStorage.getItem("bloom-brew-users");
      const storedUserId = window.localStorage.getItem("bloom-brew-current-user");
      const storedProfile = window.localStorage.getItem("bloom-brew-profile");
      const storedPosts = window.localStorage.getItem("bloom-brew-social-posts");

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers) as DemoUser[]);
      }

      if (storedUserId) {
        setCurrentUserId(storedUserId);
      }

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile) as SocialProfile);
      }

      if (storedPosts) {
        setPosts(JSON.parse(storedPosts) as SocialPost[]);
      }

      setStorageReady(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (storageReady) {
      window.localStorage.setItem("bloom-brew-users", JSON.stringify(users));
    }
  }, [storageReady, users]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    if (currentUserId) {
      window.localStorage.setItem("bloom-brew-current-user", currentUserId);
      return;
    }

    window.localStorage.removeItem("bloom-brew-current-user");
  }, [currentUserId, storageReady]);

  useEffect(() => {
    if (storageReady) {
      window.localStorage.setItem("bloom-brew-profile", JSON.stringify(profile));
    }
  }, [profile, storageReady]);

  useEffect(() => {
    if (storageReady) {
      window.localStorage.setItem("bloom-brew-social-posts", JSON.stringify(posts));
    }
  }, [posts, storageReady]);

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
      signUp(email, password, name);
      return;
    }

    signIn(email, password);
  }

  function signUp(email: string, password: string, name: string) {
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
    clearAuthForm();
    addNotification("Account created. Welcome to Bloom & Brew Social.");
  }

  function signIn(email: string, password: string) {
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
    clearAuthForm();
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

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[280px_1fr_320px]">
        <aside className="space-y-5">
          <ProfilePanel
            profile={profile}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onProfileChange={updateProfile}
            onCreateAccount={() => openAuth("signup")}
          />
          <SuggestedFollows
            people={suggestedPeople}
            following={following}
            onToggleFollow={toggleFollow}
          />
        </aside>

        <section className="space-y-5">
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
            onRequestNotification={requestBrowserNotification}
            onPublish={publishPost}
          />

          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              commentDraft={commentDrafts[post.id] ?? ""}
              onLike={toggleLike}
              onShare={sharePost}
              onBookmark={toggleBookmark}
              onCommentDraftChange={(postId, value) =>
                setCommentDrafts((current) => ({ ...current, [postId]: value }))
              }
              onAddComment={addComment}
            />
          ))}
        </section>

        <SocialSidebar
          notifications={notifications}
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
