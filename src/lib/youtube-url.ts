const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export function getYouTubeVideoId(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "www.");

    if (!youtubeHosts.has(host)) {
      return null;
    }

    if (host === "youtu.be") {
      return cleanVideoId(url.pathname.split("/").filter(Boolean)[0]);
    }

    const watchId = url.searchParams.get("v");

    if (watchId) {
      return cleanVideoId(watchId);
    }

    const [section, id] = url.pathname.split("/").filter(Boolean);

    if (["embed", "shorts", "live"].includes(section)) {
      return cleanVideoId(id);
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function cleanVideoId(value?: string) {
  const id = value?.match(/^[a-zA-Z0-9_-]{6,}$/)?.[0];

  return id ?? null;
}
