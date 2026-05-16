import { getInitials } from "@/lib/social";
import type { DemoUser, SocialProfile } from "@/types/social";

type ProfilePanelProps = {
  profile: SocialProfile;
  isAuthenticated: boolean;
  currentUser: DemoUser | null;
  onProfileChange: (profile: SocialProfile) => void;
  onCreateAccount: () => void;
};

export function ProfilePanel({
  profile,
  isAuthenticated,
  currentUser,
  onProfileChange,
  onCreateAccount,
}: ProfilePanelProps) {
  return (
    <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7c6cf] text-lg font-black text-[#211f1d]">
          {profile.avatar}
        </div>
        <div>
          <h2 className="font-black text-[#211f1d]">{profile.name}</h2>
          <p className="text-sm font-bold text-[#8a7d73]">@{profile.username}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#6f6259]">{profile.bio}</p>
      <p className="mt-3 text-sm font-bold text-[#c45572]">📍 {profile.location}</p>
      <div className="mt-4 rounded-[6px] bg-[#fff8f2] p-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c45572]">
          Account status
        </p>
        <p className="mt-1 text-sm font-bold text-[#211f1d]">
          {isAuthenticated ? `Signed in with ${currentUser?.email}` : "Guest mode"}
        </p>
        {!isAuthenticated ? (
          <button
            type="button"
            onClick={onCreateAccount}
            className="mt-3 rounded-full bg-[#211f1d] px-4 py-2 text-xs font-black text-white"
          >
            Create account
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        <input
          value={profile.name}
          onChange={(event) =>
            onProfileChange({
              ...profile,
              name: event.target.value,
              avatar: getInitials(event.target.value) || profile.avatar,
            })
          }
          className="h-10 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
          aria-label="Display name"
        />
        <input
          value={profile.username}
          onChange={(event) =>
            onProfileChange({
              ...profile,
              username: event.target.value.replace(/\s+/g, "").toLowerCase(),
            })
          }
          className="h-10 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
          aria-label="Username"
        />
        <textarea
          value={profile.bio}
          onChange={(event) => onProfileChange({ ...profile, bio: event.target.value })}
          className="min-h-20 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 py-2 text-sm font-bold"
          aria-label="Profile bio"
        />
      </div>
    </section>
  );
}
