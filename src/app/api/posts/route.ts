import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  shares: {
    userIdentifier: string;
  }[];
  author: {
    name: string;
    username: string;
    avatar: string;
  };
}, viewer?: string): SocialPost {
  return {
    id: post.id,
    source: "bloom",
    author: post.author.name,
    username: post.author.username,
    avatar: post.author.avatar,
    community: post.community,
    content: post.content,
    imageUrl: post.imageUrl,
    filter: post.filter,
    location: post.location ?? "Bloom & Brew Social",
    createdAt: post.createdAt.toISOString(),
    likes: post.likes.length,
    shares: post.shares.length,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      author: comment.authorName,
      text: comment.text,
    })),
    liked: viewer ? post.likes.some((like) => like.userIdentifier === viewer) : false,
    bookmarked: viewer
      ? post.savedBy.some((save) => save.userIdentifier === viewer)
      : false,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = await getCurrentUser();
  const viewer = user?.id ?? searchParams.get("viewer") ?? undefined;
  const feed = searchParams.get("feed");
  const where = feed === "following" && user
    ? {
        authorId: {
          in: [
            user.id,
            ...(await prisma.follow.findMany({
              where: {
                followerId: user.id,
              },
              select: {
                followingId: true,
              },
            })).map((follow) => follow.followingId),
          ],
        },
      }
    : undefined;

  if (feed === "following" && !user) {
    return NextResponse.json(
      { error: "Authentication required.", posts: [] },
      { status: 401 },
    );
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: true,
      comments: {
        orderBy: {
          createdAt: "asc",
        },
      },
      likes: true,
      savedBy: true,
      shares: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });

  return NextResponse.json({
    posts: posts.map((post) => toSocialPost(post, viewer)),
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
      { error: "Post content or image URL is required." },
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
      likes: true,
      savedBy: true,
      shares: true,
    },
  });

  return NextResponse.json({ post: toSocialPost(post, user.id) }, { status: 201 });
}
