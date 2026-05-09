"use client";

import { useMemo, useState } from "react";

import { PostCard } from "@/components/PostCard";
import type { RedditPost } from "@/types/reddit";

type DiscoverFeedProps = {
  posts: RedditPost[];
};

export function DiscoverFeed({ posts }: DiscoverFeedProps) {
  const [subreddit, setSubreddit] = useState("All");
  const [query, setQuery] = useState("");

  const subreddits = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((post) => post.subreddit))).sort()],
    [posts],
  );

  const filteredPosts = posts.filter((post) => {
    const matchesSubreddit = subreddit === "All" || post.subreddit === subreddit;
    const matchesQuery = post.title.toLowerCase().includes(query.toLowerCase());
    return matchesSubreddit && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_8px_24px_rgba(64,45,35,0.06)] md:grid-cols-[220px_1fr]">
        <label className="space-y-2">
          <span className="text-sm font-black text-[#211f1d]">Subreddit</span>
          <select
            value={subreddit}
            onChange={(event) => setSubreddit(event.target.value)}
            className="h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold text-[#211f1d]"
          >
            {subreddits.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-black text-[#211f1d]">Search titles</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="matcha, bouquet, latte..."
            className="h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold text-[#211f1d]"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
