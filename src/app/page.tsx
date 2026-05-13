import { SocialApp } from "@/components/SocialApp";
import { getRedditFeed } from "@/lib/reddit";

export default async function Home() {
  const feed = await getRedditFeed();

  return <SocialApp redditPosts={feed.posts} source={feed.source} />;
}
