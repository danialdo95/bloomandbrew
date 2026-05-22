import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import { filterClasses, filterStyles } from "@/lib/social";
import { getYouTubeVideoId, getYouTubeWatchUrl } from "@/lib/youtube-url";
import type { SocialProfile } from "@/types/social";

type PostComposerProps = {
  profile: SocialProfile;
  content: string;
  imageUrl: string;
  filter: string;
  location: string;
  onContentChange: (value: string) => void;
  onImageUrlChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onUseCurrentLocation: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
  isLocating?: boolean;
};

export function PostComposer({
  profile,
  content,
  imageUrl,
  filter,
  location,
  onContentChange,
  onImageUrlChange,
  onFilterChange,
  onLocationChange,
  onUseCurrentLocation,
  onPublish,
  isPublishing = false,
  isLocating = false,
}: PostComposerProps) {
  const youtubeVideoId = getYouTubeVideoId(imageUrl);
  const youtubeUrl = youtubeVideoId ? getYouTubeWatchUrl(youtubeVideoId) : null;

  return (
    <div className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black">
          {profile.avatar}
        </div>
        <div className="flex-1">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#c45572]">
              Create a post
            </span>
            <textarea
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              placeholder="Share a cafe visit, bouquet idea, latte art moment..."
              className="min-h-24 w-full resize-none rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#211f1d]"
            />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                Media link
              </span>
              <input
                value={imageUrl}
                onChange={(event) => onImageUrlChange(event.target.value)}
                placeholder="Paste image or YouTube URL"
                className="h-10 w-full rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                Image filter
              </span>
              <select
                value={filter}
                onChange={(event) => onFilterChange(event.target.value)}
                className="h-10 w-full rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
              >
                {Object.keys(filterClasses).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                Location
              </span>
              <div className="flex h-10 items-center rounded-[6px] border border-[#eadfd4] bg-white px-3">
                <span aria-hidden="true" className="mr-2 text-sm">
                  📍
                </span>
                <input
                  value={location}
                  onChange={(event) => onLocationChange(event.target.value)}
                  placeholder="Add location"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </label>
          </div>

          {youtubeVideoId ? (
            <div className="mt-3 overflow-hidden rounded-[6px] border border-[#eadfd4] bg-[#211f1d]">
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0`}
                title="YouTube video preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              {youtubeUrl ? (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-white px-3 py-2 text-xs font-black text-[#c45572] hover:underline"
                >
                  Previewing YouTube video
                </a>
              ) : null}
            </div>
          ) : imageUrl ? (
            <div className="mt-3 overflow-hidden rounded-[6px] border border-[#eadfd4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className={`max-h-64 w-full object-cover ${filterClasses[filter]}`}
                style={filterStyles[filter] ?? filterStyles.Natural}
              />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                disabled={isLocating || isPublishing}
                className="flex items-center gap-2 rounded-full bg-[#fff8f2] px-3 py-2 text-xs font-black text-[#211f1d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLocating ? (
                  <LoadingSpinner className="h-3 w-3" />
                ) : (
                  <span aria-hidden="true">📍</span>
                )}
                {isLocating ? "Finding location..." : "Use my location"}
              </button>
            </div>
            <button
              type="button"
              onClick={onPublish}
              disabled={isPublishing}
              className="flex min-w-32 items-center justify-center gap-2 rounded-full bg-[#211f1d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c45572] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPublishing ? <LoadingSpinner /> : null}
              {isPublishing ? "Sharing..." : "Share post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
