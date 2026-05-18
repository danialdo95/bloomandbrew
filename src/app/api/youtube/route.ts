import { NextResponse } from "next/server";

import type { SocialPost } from "@/types/social";

type YouTubeSearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
      high?: {
        url?: string;
      };
    };
  };
};

const fallbackVideos: SocialPost[] = [
  {
    id: "youtube-fallback-cafe",
    source: "youtube",
    author: "YouTube Creators",
    username: "youtube",
    avatar: "YT",
    community: "YouTube",
    content: "Cafe inspiration videos will appear here once YOUTUBE_API_KEY is configured.",
    imageUrl: null,
    youtubeVideoId: undefined,
    youtubeUrl: undefined,
    youtubeChannel: "YouTube",
    filter: "Natural",
    location: "Video inspiration",
    createdAt: new Date(0).toISOString(),
    likes: 0,
    shares: 0,
    externalCommentCount: 0,
    comments: [],
    liked: false,
    bookmarked: false,
  },
];

function toSocialPost(item: YouTubeSearchItem): SocialPost | null {
  const videoId = item.id?.videoId;
  const snippet = item.snippet;

  if (!videoId || !snippet?.title) {
    return null;
  }

  const channel = snippet.channelTitle ?? "YouTube";

  return {
    id: `youtube-${videoId}`,
    source: "youtube",
    author: channel,
    username: channel.toLowerCase().replace(/[^a-z0-9_]/g, "") || "youtube",
    avatar: "YT",
    community: "YouTube",
    content: snippet.title,
    imageUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url ?? null,
    youtubeVideoId: videoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    youtubeChannel: channel,
    filter: "Natural",
    location: "Video inspiration",
    createdAt: snippet.publishedAt ?? new Date().toISOString(),
    likes: 0,
    shares: 0,
    externalCommentCount: 0,
    comments: [
      {
        id: `youtube-${videoId}-comment`,
        author: "Bloom & Brew",
        text: "Suggested from YouTube for cafe and floral inspiration.",
        system: true,
      },
    ],
    liked: false,
    bookmarked: false,
  };
}

function isSocialPost(post: SocialPost | null): post is SocialPost {
  return Boolean(post);
}

export async function GET(request: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "cafe latte art flowers bouquet";

  if (!apiKey) {
    return NextResponse.json({
      posts: fallbackVideos,
      source: "fallback",
      error: "YOUTUBE_API_KEY is not configured.",
    });
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "5",
    safeSearch: "moderate",
    key: apiKey,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    {
      next: {
        revalidate: 300,
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        posts: fallbackVideos,
        source: "fallback",
        error: `YouTube API request failed with status ${response.status}.`,
      },
      { status: response.status },
    );
  }

  const data = (await response.json()) as {
    items?: YouTubeSearchItem[];
  };

  return NextResponse.json({
    posts: (data.items ?? []).map(toSocialPost).filter(isSocialPost),
    source: "youtube",
  });
}
