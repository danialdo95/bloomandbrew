import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decodePostCursor, encodePostCursor } from "@/lib/post-cursor";
import { getYouTubeVideoId, getYouTubeWatchUrl } from "@/lib/youtube-url";
import type { SocialPost } from "@/types/social";

function toSocialPost(post: {
  id: string;
  community: string;
  content: string;
  imageUrl: string | null;
  filter: string;
  location: string | null;
  createdAt: Date;
  comments: {
    id: string;
    authorName: string;
    text: string;
  }[];
  likes: {
    userIdentifier: string;
  }[];
  savedBy: {
    userIdentifier: string;
  }[];
  _count: {
    comments: number;
    likes: number;
    shares: number;
  };
  author: {
    name: string;
    username: string;
    avatar: string;
  };
}, viewer?: string): SocialPost {
  const youtubeVideoId = getYouTubeVideoId(post.imageUrl);

  return {
    id: post.id,
    source: "bloom",
    author: post.author.name,
    username: post.author.username,
    avatar: post.author.avatar,
    community: post.community,
    content: post.content,
    imageUrl: youtubeVideoId ? null : post.imageUrl,
    youtubeVideoId: youtubeVideoId ?? undefined,
    youtubeUrl: youtubeVideoId ? getYouTubeWatchUrl(youtubeVideoId) : undefined,
    youtubeChannel: youtubeVideoId ? "Shared YouTube video" : undefined,
    filter: post.filter,
    location: post.location ?? "Bloom & Brew Social",
    createdAt: post.createdAt.toISOString(),
    likes: post._count.likes,
    shares: post._count.shares,
    comments: [...post.comments].reverse().map((comment) => ({
      id: comment.id,
      author: comment.authorName,
      text: comment.text,
    })),
    liked: viewer ? post.likes.some((like) => like.userIdentifier === viewer) : false,
    bookmarked: viewer
      ? post.savedBy.some((save) => save.userIdentifier === viewer)
      : false,
    commentCount: post._count.comments,
  };
}

const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = await getCurrentUser();
  const viewer = user?.id;
  const feed = searchParams.get("feed");
  const limitParam = searchParams.get("limit");
  const requestedLimit = limitParam === null ? Number.NaN : Number(limitParam);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const cursor = decodePostCursor(searchParams.get("cursor"));

  if (searchParams.has("cursor") && !cursor) {
    return NextResponse.json({ error: "Invalid pagination cursor." }, { status: 400 });
  }

  if (feed === "following" && !user) {
    return NextResponse.json(
      { error: "Authentication required.", posts: [] },
      { status: 401 },
    );
  }

  const followingIds = feed === "following" && user
    ? (
        await prisma.follow.findMany({
          where: {
            followerId: user.id,
          },
          select: {
            followingId: true,
          },
        })
      ).map((follow) => follow.followingId)
    : [];
  const feedWhere = feed === "following" && user
    ? {
        status: "VISIBLE",
        authorId: {
          in: [user.id, ...followingIds],
        },
      }
    : {
        status: "VISIBLE",
      };
  const where = cursor
    ? {
        ...feedWhere,
        OR: [
          { createdAt: { lt: new Date(cursor.createdAt) } },
          { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
        ],
      }
    : feedWhere;

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: true,
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
      likes: {
        where: {
          userIdentifier: viewer ?? "",
        },
        select: {
          userIdentifier: true,
        },
      },
      savedBy: {
        where: {
          userIdentifier: viewer ?? "",
        },
        select: {
          userIdentifier: true,
        },
      },
      _count: {
        select: {
          likes: true,
          shares: true,
          comments: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;
  const lastPost = page.at(-1);

  return NextResponse.json({
    posts: page.map((post) => toSocialPost(post, viewer)),
    nextCursor: hasMore && lastPost ? encodePostCursor(lastPost) : null,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    content?: unknown;
    imageUrl?: unknown;
    filter?: unknown;
    location?: unknown;
  };

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const filter = typeof body.filter === "string" && body.filter.trim()
    ? body.filter.trim()
    : "Natural";
  const location = typeof body.location === "string" && body.location.trim()
    ? body.location.trim()
    : "Bloom & Brew Social";
  if (!content && !imageUrl) {
    return NextResponse.json(
      { error: "Post content or media URL is required." },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      community: "Bloom & Brew",
      content: content || "Shared a new Bloom & Brew moment.",
      imageUrl: imageUrl || null,
      filter,
      location,
    },
    include: {
      author: true,
      comments: true,
      likes: {
        where: {
          userIdentifier: user.id,
        },
        select: {
          userIdentifier: true,
        },
      },
      savedBy: {
        where: {
          userIdentifier: user.id,
        },
        select: {
          userIdentifier: true,
        },
      },
      _count: {
        select: {
          likes: true,
          shares: true,
          comments: true,
        },
      },
    },
  });

  return NextResponse.json({ post: toSocialPost(post, user.id) }, { status: 201 });
}
