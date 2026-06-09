import { prisma } from "@/lib/prisma";
import { getRedditFeed } from "@/lib/reddit";
import { getTrendingKeywords } from "@/lib/trends";
import type { RedditPost } from "@/types/reddit";

export function formatAdminDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function truncateAdminText(value: string, length = 92) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

function toTrendPost(id: string, title: string, createdAt: Date | string): RedditPost {
  return {
    id,
    title,
    author: "Bloom & Brew",
    subreddit: "Bloom",
    score: 0,
    comments: 0,
    url: "#",
    permalink: "#",
    imageUrl: null,
    createdAt: new Date(createdAt).toISOString(),
  };
}

export function getSuggestion(keyword: string, index: number) {
  const angles = [
    "Turn this into a cafe visit prompt with a clear photo idea.",
    "Pair this topic with a bouquet styling tip for creators.",
    "Use this as a short trend summary for the weekly community post.",
    "Create a discussion question that invites comments from followers.",
  ];

  return {
    title: `${keyword} content idea`,
    detail: angles[index % angles.length],
    hashtags: [`#${keyword.replace(/[^a-z0-9]/gi, "")}`, "#BloomAndBrew", "#CafeFlorals"],
  };
}

export async function getAdminOverview() {
  const [
    redditFeed,
    totalUsers,
    totalPosts,
    totalComments,
    totalFollows,
    totalNotifications,
    externalPosts,
  ] = await Promise.all([
    getRedditFeed(),
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.follow.count(),
    prisma.notification.count(),
    prisma.externalPost.count(),
  ]);

  return {
    redditFeed,
    totalUsers,
    totalPosts,
    totalComments,
    totalFollows,
    totalNotifications,
    externalPosts,
  };
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });
}

export async function getAdminPosts() {
  return prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
          likes: true,
          savedBy: true,
          shares: true,
        },
      },
    },
  });
}

export async function getAdminTrends(limit = 10) {
  const [redditFeed, posts] = await Promise.all([
    getRedditFeed(),
    prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    }),
  ]);

  const bloomTrendPosts = posts.map((post) =>
    toTrendPost(post.id, post.content, post.createdAt),
  );

  return {
    source: redditFeed.source,
    trends: getTrendingKeywords([...redditFeed.posts, ...bloomTrendPosts], limit),
  };
}

export async function getAdminIntegrations() {
  const [redditFeed, externalPosts] = await Promise.all([
    getRedditFeed(),
    prisma.externalPost.count(),
  ]);
  const youtubeConfigured = Boolean(process.env.YOUTUBE_API_KEY);

  return [
    {
      label: "Reddit feed",
      status: redditFeed.source === "reddit" ? "Live" : "Fallback",
      detail: `${redditFeed.posts.length} external posts available`,
    },
    {
      label: "YouTube API",
      status: youtubeConfigured ? "Configured" : "Fallback",
      detail: youtubeConfigured ? "API key available" : "Waiting for API key",
    },
    {
      label: "External interactions",
      status: "Mirrored",
      detail: `${externalPosts.toLocaleString()} records stored`,
    },
  ];
}
