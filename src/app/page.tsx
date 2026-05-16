import { SocialApp } from "@/components/SocialApp";
import { getRedditFeed } from "@/lib/reddit";

export default async function Home() {
  const feed = await getRedditFeed();

  return (
  <>
    <SocialApp redditPosts={feed.posts} source={feed.source} />

    <section className="mt-6 rounded-xl bg-white p-4 shadow">
      <h2 className="text-xl font-bold mb-3">
        🎥 Live Suggested Videos
      </h2>

      <iframe
        className="w-full rounded-xl"
        height="220"
        src="https://www.youtube.com/embed/videoseries?listType=search&list=coffee%20cafe%20latte%20art&autoplay=1&mute=1"
        title="Live YouTube Suggestions"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />

      <p className="mt-2 text-sm text-gray-500">
        Auto-play suggested café videos from YouTube.
      </p>
    </section>
  </>
);
}
