import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = "AIzaSyB5hFhxBh5gqPOGRw-Cx11-B95l-E5V3ls";

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=cafe latte art coffee&type=video&maxResults=5&key=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  return NextResponse.json(data);
}
