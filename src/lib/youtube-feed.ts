import type { SocialPost } from "@/types/social";

type YouTubeSearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
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

export type YouTubeFeedResponse = {
  posts: SocialPost[];
  source: "youtube" | "fallback";
  error?: string;
};

const fallbackVideos: SocialPost[] = [
  {
    id: "youtube-fallback-cafe",
    source: "youtube",
    sourceLabel: "Curated YouTube inspiration",
    author: "Bloom Video Picks",
    username: "bloomvideo",
    avatar: "BV",
    community: "YouTube",
    content: "Latte art practice ideas for creators planning their next cafe reel.",
    imageUrl:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    youtubeVideoId: undefined,
    youtubeUrl: "https://www.youtube.com/results?search_query=latte+art+cafe+inspiration",
    youtubeChannel: "Curated cafe videos",
    filter: "Natural",
    location: "Curated video inspiration",
    createdAt: "2026-05-10T09:30:00.000Z",
    likes: 348,
    shares: 24,
    externalCommentCount: 12,
    comments: [
      {
        id: "youtube-fallback-cafe-comment",
        author: "Bloom & Brew",
        text: "Curated while the live YouTube source is unavailable.",
        system: true,
      },
    ],
    liked: false,
    bookmarked: false,
  },
  {
    id: "youtube-fallback-bouquet",
    source: "youtube",
    sourceLabel: "Curated YouTube inspiration",
    author: "Bloom Video Picks",
    username: "bloomvideo",
    avatar: "BV",
    community: "YouTube",
    content: "Short-form bouquet styling prompts for floral creators and cafe displays.",
    imageUrl:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80",
    youtubeVideoId: undefined,
    youtubeUrl: "https://www.youtube.com/results?search_query=bouquet+styling+floral+arrangement",
    youtubeChannel: "Curated floral videos",
    filter: "Natural",
    location: "Curated video inspiration",
    createdAt: "2026-05-09T14:45:00.000Z",
    likes: 286,
    shares: 19,
    externalCommentCount: 9,
    comments: [
      {
        id: "youtube-fallback-bouquet-comment",
        author: "Bloom & Brew",
        text: "Curated while the live YouTube source is unavailable.",
        system: true,
      },
    ],
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

export async function getYouTubeFeed(
  query = "cafe latte art flowers bouquet",
): Promise<YouTubeFeedResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return {
      posts: fallbackVideos,
      source: "fallback",
      error: "YOUTUBE_API_KEY is not configured.",
    };
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "20",
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
    return {
      posts: fallbackVideos,
      source: "fallback",
      error: `YouTube API request failed with status ${response.status}.`,
    };
  }

  const data = (await response.json()) as {
    items?: YouTubeSearchItem[];
  };
  const posts = (data.items ?? []).map(toSocialPost).filter(isSocialPost);

  return {
    posts: posts.length ? posts : fallbackVideos,
    source: posts.length ? "youtube" : "fallback",
  };
}
