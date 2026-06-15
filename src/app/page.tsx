import { SocialApp } from "@/components/SocialApp";
import { getRedditFeed } from "@/lib/reddit";
import { getYouTubeFeed } from "@/lib/youtube-feed";

export default async function Home() {
  const [redditFeed, youtubeFeed] = await Promise.all([
    getRedditFeed(),
    getYouTubeFeed(),
  ]);

  return (
    <SocialApp
      redditPosts={redditFeed.posts}
      source={redditFeed.source}
      youtubePosts={youtubeFeed.posts}
      youtubeSource={youtubeFeed.source}
    />
  );
}
