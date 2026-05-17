import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=cafe latte art coffee&type=video&maxResults=5&key=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  return NextResponse.json(data);
}
