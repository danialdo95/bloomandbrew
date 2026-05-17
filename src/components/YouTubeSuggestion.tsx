"use client";

import { useEffect, useState } from "react";

export function YouTubeSuggestion() {
  const [videoId, setVideoId] = useState("");

  useEffect(() => {
    async function loadVideo() {
      const res = await fetch("/api/youtube");
      const data = await res.json();

      const id = data.items?.[0]?.id?.videoId;
      setVideoId(id);
    }

    loadVideo();
  }, []);

  if (!videoId) return <p>Loading YouTube suggestion...</p>;

  return (
    <section className="mt-6 rounded-xl bg-white p-4 shadow">
      <h2 className="text-xl font-bold mb-3">
        🎥 Auto Suggested Café Video
      </h2>

      <iframe
        className="w-full rounded-xl"
        height="220"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`}
        title="Auto Suggested Café Video"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />

      <p className="mt-2 text-sm text-gray-500">
        Suggested automatically from YouTube API based on café and latte content.
      </p>
    </section>
  );
}
