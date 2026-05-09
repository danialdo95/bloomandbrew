import { StatCard } from "@/components/StatCard";
import { TrendTags } from "@/components/TrendTags";
import { getRedditFeed } from "@/lib/reddit";
import { getSubredditStats, getTrendingKeywords } from "@/lib/trends";

export default async function TrendsPage() {
  const feed = await getRedditFeed();
  const trends = getTrendingKeywords(feed.posts, 14);
  const subredditStats = getSubredditStats(feed.posts);
  const totalScore = feed.posts.reduce((sum, post) => sum + post.score, 0);
  const totalComments = feed.posts.reduce((sum, post) => sum + post.comments, 0);
  const maxScore = Math.max(...subredditStats.map((stat) => stat.score), 1);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c45572]">
          Trending searches
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#211f1d]">
          Social signals across Bloom & Brew communities
        </h1>
        <p className="mt-4 text-base leading-7 text-[#6f6259]">
          Keyword frequency, subreddit activity, and engagement totals show how
          cafe and florist topics move through Reddit communities.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Posts"
          value={feed.posts.length.toString()}
          detail={`${feed.source === "reddit" ? "Live Reddit" : "Fallback"} data source`}
        />
        <StatCard
          label="Upvotes"
          value={totalScore.toLocaleString()}
          detail="Total score in the current dataset"
        />
        <StatCard
          label="Comments"
          value={totalComments.toLocaleString()}
          detail="Conversation count across posts"
        />
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[6px] border border-[#eadfd4] bg-white p-6 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
          <h2 className="text-2xl font-black text-[#211f1d]">
            Trending keywords
          </h2>
          <div className="mt-5">
            <TrendTags trends={trends} />
          </div>
        </div>

        <div className="rounded-[6px] border border-[#eadfd4] bg-white p-6 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
          <h2 className="text-2xl font-black text-[#211f1d]">
            Popular subreddit analysis
          </h2>
          <div className="mt-6 space-y-5">
            {subredditStats.map((stat) => (
              <div key={stat.subreddit}>
                <div className="mb-2 flex justify-between text-sm font-black text-[#211f1d]">
                  <span>r/{stat.subreddit}</span>
                  <span>{stat.score.toLocaleString()} upvotes</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#f0ded4]">
                  <div
                    className="h-full rounded-full bg-[#f7c6cf]"
                    style={{ width: `${Math.max((stat.score / maxScore) * 100, 6)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#8a7d73]">
                  {stat.posts} posts tracked
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
