"use client";

import { useEffect, useState } from "react";

type Video = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
  };
};

export function YouTubeSuggestion() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    async function loadVideos() {
      const res = await fetch("/api/youtube");
      const data = await res.json();

      setVideos(data.items || []);
    }

    loadVideos();
  }, []);

  if (videos.length === 0) {
    return <p>Loading YouTube suggestions...</p>;
  }

  return (
    <section className="mt-6 rounded-xl bg-white p-4 shadow">
      <h2 className="text-xl font-bold mb-3">🎥 Auto Suggested Café Videos</h2>

      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id.videoId}>
            <iframe
              className="w-full rounded-xl"
              height="220"
              src={`https://www.youtube.com/embed/${video.id.videoId}?autoplay=0&mute=1&rel=0`}
              title={video.snippet.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />

            <p className="mt-2 text-sm font-semibold">
              {video.snippet.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
