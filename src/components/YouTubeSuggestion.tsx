"use client";

import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import type { SocialPost } from "@/types/social";

export function YouTubeSuggestion() {
  const [videos, setVideos] = useState<SocialPost[]>([]);

  useEffect(() => {
    async function loadVideos() {
      const res = await fetch("/api/youtube");
      const data = await res.json();

      setVideos(data.posts || []);
    }

    loadVideos();
  }, []);

  if (videos.length === 0) {
    return (
      <p className="mt-6 flex items-center gap-2 rounded-[6px] bg-white p-4 text-sm font-bold text-[#6f6259] shadow">
        <LoadingSpinner className="text-[#c45572]" />
        Loading YouTube suggestions...
      </p>
    );
  }

  return (
    <section className="mt-6 rounded-xl bg-white p-4 shadow">
      <h2 className="text-xl font-bold mb-3">🎥 Auto Suggested Café Videos</h2>

      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id}>
            {video.youtubeVideoId ? (
              <iframe
                className="w-full rounded-xl"
                height="220"
                src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=0&mute=1&rel=0`}
                title={video.content}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : null}

            <p className="mt-2 text-sm font-semibold">
              {video.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
