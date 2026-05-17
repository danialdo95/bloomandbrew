import { filterClasses } from "@/lib/social";
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
  onRequestNotification: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
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
  onRequestNotification,
  onPublish,
  isPublishing = false,
}: PostComposerProps) {
  return (
    <div className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black">
          {profile.avatar}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="Share a cafe visit, bouquet idea, latte art moment..."
            className="min-h-24 w-full resize-none rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#211f1d]"
          />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              value={imageUrl}
              onChange={(event) => onImageUrlChange(event.target.value)}
              placeholder="Image URL"
              className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
            />
            <select
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
              className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
            >
              {Object.keys(filterClasses).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              placeholder="Location"
              className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold"
            />
          </div>

          {imageUrl ? (
            <div className="mt-3 overflow-hidden rounded-[6px] border border-[#eadfd4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className={`max-h-64 w-full object-cover ${filterClasses[filter]}`}
              />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                className="rounded-full bg-[#fff8f2] px-3 py-2 text-xs font-black text-[#211f1d]"
              >
                Tag location
              </button>
              <button
                type="button"
                onClick={onRequestNotification}
                className="rounded-full bg-[#fff8f2] px-3 py-2 text-xs font-black text-[#211f1d]"
              >
                Enable notifications
              </button>
            </div>
            <button
              type="button"
              onClick={onPublish}
              disabled={isPublishing}
              className="rounded-full bg-[#211f1d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c45572]"
            >
              {isPublishing ? "Sharing..." : "Share post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
