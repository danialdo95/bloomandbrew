import type { RedditPost } from "@/types/reddit";

const stopWords = new Set([
  "about",
  "after",
  "again",
  "best",
  "from",
  "have",
  "into",
  "just",
  "like",
  "make",
  "this",
  "that",
  "the",
  "with",
  "what",
  "when",
  "where",
  "your",
  "for",
  "and",
  "are",
  "how",
  "its",
  "our",
]);

export function getTrendingKeywords(posts: RedditPost[], limit = 10) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const words = post.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 3 && !stopWords.has(word));

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getSubredditStats(posts: RedditPost[]) {
  const stats = new Map<string, { subreddit: string; posts: number; score: number }>();

  for (const post of posts) {
    const current = stats.get(post.subreddit) ?? {
      subreddit: post.subreddit,
      posts: 0,
      score: 0,
    };

    current.posts += 1;
    current.score += post.score;
    stats.set(post.subreddit, current);
  }

  return Array.from(stats.values()).sort((a, b) => b.score - a.score);
}
