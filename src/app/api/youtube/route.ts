import { NextResponse } from "next/server";

import { getYouTubeFeed } from "@/lib/youtube-feed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const feed = await getYouTubeFeed(query);

  return NextResponse.json(feed);
}
