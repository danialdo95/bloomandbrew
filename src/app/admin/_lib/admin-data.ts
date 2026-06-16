import { prisma } from "@/lib/prisma";
import { getRedditFeed } from "@/lib/reddit";
import { getTrendingKeywords } from "@/lib/trends";
import type { RedditPost } from "@/types/reddit";

export const ADMIN_PAGE_SIZE = 10;

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

export function normalizeAdminPage(value?: string) {
  const page = Number(value ?? 1);

  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function getAdminPagination(total: number, page: number) {
  const totalPages = Math.max(Math.ceil(total / ADMIN_PAGE_SIZE), 1);

  return {
    page,
    pageSize: ADMIN_PAGE_SIZE,
    total,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
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

export async function getAdminUsers({
  page = 1,
  query = "",
}: {
  page?: number;
  query?: string;
} = {}) {
  const search = query.trim();
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { location: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: getAdminPagination(total, page),
  };
}

export async function getAdminUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function getAdminPosts({
  page = 1,
  query = "",
  status = "all",
}: {
  page?: number;
  query?: string;
  status?: string;
} = {}) {
  const search = query.trim();
  const statusFilter = status.toUpperCase();
  const statusWhere = statusFilter === "VISIBLE" || statusFilter === "HIDDEN"
    ? { status: statusFilter }
    : {};
  const searchWhere = search
    ? {
        OR: [
          { content: { contains: search, mode: "insensitive" as const } },
          { community: { contains: search, mode: "insensitive" as const } },
          { author: { name: { contains: search, mode: "insensitive" as const } } },
          { author: { username: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};
  const where = {
    ...statusWhere,
    ...searchWhere,
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
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
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: getAdminPagination(total, page),
  };
}

export async function getAdminCalendarEvents({
  page = 1,
  query = "",
  status = "all",
  type = "all",
}: {
  page?: number;
  query?: string;
  status?: string;
  type?: string;
} = {}) {
  const search = query.trim();
  const statusFilter = status.toUpperCase();
  const typeFilter = type.toUpperCase();
  const statusWhere = statusFilter === "DRAFT"
    || statusFilter === "SCHEDULED"
    || statusFilter === "COMPLETED"
    || statusFilter === "CANCELLED"
    ? { status: statusFilter }
    : {};
  const typeWhere = typeFilter === "CAFE"
    || typeFilter === "FLORAL"
    || typeFilter === "SOCIAL"
    || typeFilter === "PROMOTION"
    || typeFilter === "CONTENT"
    ? { eventType: typeFilter }
    : {};
  const searchWhere = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { prompt: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const where = {
    ...statusWhere,
    ...typeWhere,
    ...searchWhere,
  };

  const [events, total] = await Promise.all([
    prisma.calendarEvent.findMany({
      where,
      orderBy: {
        startsAt: "asc",
      },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.calendarEvent.count({ where }),
  ]);

  return {
    events,
    pagination: getAdminPagination(total, page),
  };
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
