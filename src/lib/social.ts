import type { RedditPost } from "@/types/reddit";
import type { SocialPost, SocialProfile, SuggestedPerson } from "@/types/social";
import type { CSSProperties } from "react";

export const defaultProfile: SocialProfile = {
  name: "Bloom Barista",
  username: "bloombarista",
  bio: "Finding the soft spot between latte art, flowers, and slow cafe moments.",
  location: "Kuala Lumpur",
  avatar: "BB",
};

export const suggestedPeople: SuggestedPerson[] = [
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

export const filterClasses: Record<string, string> = {
  Natural: "",
  Blush: "saturate-125 sepia-[0.12]",
  Cream: "brightness-105 contrast-90",
  Vintage: "sepia-[0.35] contrast-95",
};

export const filterStyles: Record<string, CSSProperties> = {
  Natural: {},
  Blush: {
    filter: "saturate(1.3) sepia(0.18) hue-rotate(325deg) brightness(1.04)",
  },
  Cream: {
    filter: "brightness(1.14) contrast(0.88) saturate(0.92)",
  },
  Vintage: {
    filter: "sepia(0.55) contrast(0.9) saturate(0.85)",
  },
};

export function seedSocialPosts(posts: RedditPost[]): SocialPost[] {
  return posts.slice(0, 8).map((post, index) => ({
    id: post.id,
    source: "reddit",
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

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function getTimeLabel(date: string) {
  const timestamp = new Date(date).getTime();
  const diff = Date.now() - timestamp;
  const hours = Math.max(Math.round(diff / 1000 / 60 / 60), 1);

  if (hours > 48) {
    return `${Math.round(hours / 24)}d`;
  }

  return `${hours}h`;
}
