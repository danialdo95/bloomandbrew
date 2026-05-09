import { GalleryGrid } from "@/components/GalleryGrid";
import { PollCard } from "@/components/PollCard";
import { PostCard } from "@/components/PostCard";
import { StatCard } from "@/components/StatCard";
import { TrendTags } from "@/components/TrendTags";
import { getRedditFeed } from "@/lib/reddit";
import { getTrendingKeywords } from "@/lib/trends";

export default async function Home() {
  const feed = await getRedditFeed();
  const posts = feed.posts;
  const trends = getTrendingKeywords(posts, 8);
  const totalScore = posts.reduce((sum, post) => sum + post.score, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
  const heroPost = posts.find((post) => post.imageUrl);

  return (
    <main>
      <section className="border-b border-[#eadfd4] bg-[#fff8f2]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#c45572]">
              Curated from cafe and floral communities
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.02] text-[#211f1d] md:text-7xl">
              Fresh blooms, warm brews, social buzz.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6f6259]">
              Bloom & Brew Social gathers cafe, coffee, flower, florist, and
              plant discussions into one visual dashboard for discovery,
              analysis, and lightweight community engagement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/discover"
                className="rounded-full bg-[#211f1d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c45572]"
              >
                Shop the feed
              </a>
              <a
                href="/trends"
                className="rounded-full border border-[#211f1d] bg-white px-6 py-3 text-sm font-black text-[#211f1d] transition hover:bg-[#fff176]"
              >
                View trends
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
            <div className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_16px_44px_rgba(64,45,35,0.12)]">
              {heroPost?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroPost.imageUrl}
                  alt=""
                  className="h-[430px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[430px] items-center justify-center bg-[#f7c6cf] px-8 text-center text-3xl font-black text-[#211f1d]">
                  Bloom & Brew Social
                </div>
              )}
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                  Featured inspiration
                </p>
                <h2 className="mt-2 text-xl font-black text-[#211f1d]">
                  {heroPost?.title ?? "Cafe culture meets floral inspiration"}
                </h2>
              </div>
            </div>

            <div className="grid gap-4">
              <StatCard
                label="Posts tracked"
                value={posts.length.toString()}
                detail={`${feed.source === "reddit" ? "Live" : "Fallback"} feed across six communities`}
              />
              <StatCard
                label="Upvotes"
                value={totalScore.toLocaleString()}
                detail="Combined social signal from the current feed"
              />
              <StatCard
                label="Comments"
                value={totalComments.toLocaleString()}
                detail="Conversation volume across cafe and florist topics"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c45572]">
              Most popular
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#211f1d]">
              Bestselling community posts
            </h2>
          </div>
          <a href="/discover" className="text-sm font-black text-[#c45572]">
            See more posts
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} compact />
          ))}
        </div>
      </section>

      <section className="border-y border-[#eadfd4] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c45572]">
              Now in season
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#211f1d]">
              Visual ideas from latte art, flowers, and cafe spaces
            </h2>
          </div>
          <GalleryGrid posts={posts} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c45572]">
              Trending searches
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#211f1d]">
              Keywords shaping the current conversation
            </h2>
          </div>
          <TrendTags trends={trends} />
        </div>
      </section>

      <section className="border-t border-[#eadfd4] bg-[#fff8f2]">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <PollCard
            id="homepage-atmosphere"
            question="Which atmosphere fits Bloom & Brew best?"
            options={["Botanical cafe", "Minimalist espresso bar", "Flower market corner"]}
          />
        </div>
      </section>
    </main>
  );
}
