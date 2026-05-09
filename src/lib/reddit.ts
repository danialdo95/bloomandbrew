import { fallbackPosts } from "@/lib/fallback-posts";
import type { RedditFeedResponse, RedditPost } from "@/types/reddit";

export const targetSubreddits = [
  "Coffee",
  "Cafe",
  "LatteArt",
  "flowers",
  "florists",
  "houseplants",
] as const;

type RedditListingChild = {
  data?: {
    id?: string;
    title?: string;
    author?: string;
    subreddit?: string;
    score?: number;
    num_comments?: number;
    url?: string;
    permalink?: string;
    thumbnail?: string;
    created_utc?: number;
    preview?: {
      images?: Array<{
        source?: {
          url?: string;
        };
      }>;
    };
  };
};

type RedditListing = {
  data?: {
    children?: RedditListingChild[];
  };
};

const REDDIT_BASE_URL = "https://www.reddit.com";
const imageExtensions = /\.(avif|gif|jpe?g|png|webp)(\?.*)?$/i;

function decodeRedditUrl(url: string) {
  return url.replaceAll("&amp;", "&");
}

function getImageUrl(data: NonNullable<RedditListingChild["data"]>) {
  const previewUrl = data.preview?.images?.[0]?.source?.url;

  if (previewUrl) {
    return decodeRedditUrl(previewUrl);
  }

  if (data.url && imageExtensions.test(data.url)) {
    return data.url;
  }

  if (data.thumbnail?.startsWith("http")) {
    return data.thumbnail;
  }

  return null;
}

function normalizePost(child: RedditListingChild): RedditPost | null {
  const data = child.data;

  if (!data?.id || !data.title || !data.subreddit) {
    return null;
  }

  return {
    id: `${data.subreddit}-${data.id}`,
    title: data.title,
    author: data.author ?? "unknown",
    subreddit: data.subreddit,
    score: data.score ?? 0,
    comments: data.num_comments ?? 0,
    url: data.url ?? `${REDDIT_BASE_URL}${data.permalink ?? ""}`,
    permalink: `${REDDIT_BASE_URL}${data.permalink ?? `/r/${data.subreddit}/`}`,
    imageUrl: getImageUrl(data),
    createdAt: data.created_utc
      ? new Date(data.created_utc * 1000).toISOString()
      : new Date().toISOString(),
  };
}

async function fetchSubreddit(subreddit: string) {
  const response = await fetch(`${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=12`, {
    headers: {
      "User-Agent": "BloomAndBrewSocial/1.0",
    },
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit request failed for r/${subreddit}: ${response.status}`);
  }

  const listing = (await response.json()) as RedditListing;
  return listing.data?.children?.map(normalizePost).filter(Boolean) ?? [];
}

export async function getRedditFeed(): Promise<RedditFeedResponse> {
  try {
    const results = await Promise.allSettled(
      targetSubreddits.map((subreddit) => fetchSubreddit(subreddit)),
    );
    const posts = results
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .filter((post): post is RedditPost => Boolean(post))
      .sort((a, b) => b.score - a.score);

    if (posts.length === 0) {
      throw new Error("No Reddit posts returned");
    }

    return {
      posts,
      source: "reddit",
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return {
      posts: fallbackPosts,
      source: "fallback",
      fetchedAt: new Date().toISOString(),
    };
  }
}
