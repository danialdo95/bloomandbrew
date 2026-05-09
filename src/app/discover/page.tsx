import { DiscoverFeed } from "@/components/DiscoverFeed";
import { getRedditFeed } from "@/lib/reddit";

export default async function DiscoverPage() {
  const feed = await getRedditFeed();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c45572]">
          Flowers, plants, coffee, and cafe culture
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#211f1d]">
          Browse the Bloom & Brew collection
        </h1>
        <p className="mt-4 text-base leading-7 text-[#6f6259]">
          Filter the current feed by subreddit or search for topics such as
          matcha, bouquet, espresso, interior styling, and plants.
        </p>
      </div>

      <DiscoverFeed posts={feed.posts} />
    </main>
  );
}
