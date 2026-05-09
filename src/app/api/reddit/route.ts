import { getRedditFeed } from "@/lib/reddit";

export const revalidate = 300;

export async function GET() {
  const feed = await getRedditFeed();

  return Response.json(feed);
}
