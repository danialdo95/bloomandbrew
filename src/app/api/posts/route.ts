import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import type { SocialPost, SocialProfile } from "@/types/social";

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
  author: {
    name: string;
    username: string;
    avatar: string;
  };
}, viewer?: string): SocialPost {
  return {
    id: post.id,
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
    shares: 0,
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

function normalizeUsername(value: string) {
  return value.replace(/[^a-z0-9_]/gi, "").toLowerCase() || "bloombarista";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewer = searchParams.get("viewer") ?? undefined;
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      comments: {
        orderBy: {
          createdAt: "asc",
        },
      },
      likes: true,
      savedBy: true,
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
  const body = (await request.json()) as {
    content?: unknown;
    imageUrl?: unknown;
    filter?: unknown;
    location?: unknown;
    profile?: Partial<SocialProfile>;
  };

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const filter = typeof body.filter === "string" && body.filter.trim()
    ? body.filter.trim()
    : "Natural";
  const location = typeof body.location === "string" && body.location.trim()
    ? body.location.trim()
    : "Bloom & Brew Social";
  const profile = body.profile ?? {};

  if (!content && !imageUrl) {
    return NextResponse.json(
      { error: "Post content or image URL is required." },
      { status: 400 },
    );
  }

  const username = normalizeUsername(
    typeof profile.username === "string" ? profile.username : "bloombarista",
  );
  const name = typeof profile.name === "string" && profile.name.trim()
    ? profile.name.trim()
    : "Bloom Barista";
  const avatar = typeof profile.avatar === "string" && profile.avatar.trim()
    ? profile.avatar.trim().slice(0, 4)
    : "BB";

  const author = await prisma.user.upsert({
    where: {
      username,
    },
    update: {
      name,
      avatar,
      bio: typeof profile.bio === "string" ? profile.bio : undefined,
      location: typeof profile.location === "string" ? profile.location : undefined,
    },
    create: {
      email: `${username}@bloomandbrew.local`,
      username,
      name,
      avatar,
      bio: typeof profile.bio === "string" ? profile.bio : "Bloom & Brew member.",
      location: typeof profile.location === "string" ? profile.location : location,
    },
  });

  const post = await prisma.post.create({
    data: {
      authorId: author.id,
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
    },
  });

  return NextResponse.json({ post: toSocialPost(post) }, { status: 201 });
}
