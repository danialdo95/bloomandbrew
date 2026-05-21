import { useState } from "react";

import { getInitials } from "@/lib/social";
import type { DemoUser, SocialProfile } from "@/types/social";

type ProfilePanelProps = {
  profile: SocialProfile;
  isAuthenticated: boolean;
  currentUser: DemoUser | null;
  onProfileChange: (profile: SocialProfile) => Promise<void>;
  onCreateAccount: () => void;
};

export function ProfilePanel({
  profile,
  isAuthenticated,
  currentUser,
  onProfileChange,
  onCreateAccount,
}: ProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateDraft(nextProfile: SocialProfile) {
    setDraft(nextProfile);
    setMessage("");
  }

  async function saveProfile() {
    setIsSaving(true);
    setMessage("");

    try {
      await onProfileChange({
        ...draft,
        name: draft.name.trim() || profile.name,
        username: draft.username.replace(/[^a-z0-9_]/gi, "").toLowerCase(),
        bio: draft.bio.trim(),
        location: draft.location.trim() || "Bloom & Brew Social",
        avatar: getInitials(draft.name) || profile.avatar,
      });
      setIsEditing(false);
      setDraft({
        ...draft,
        name: draft.name.trim() || profile.name,
        username: draft.username.replace(/[^a-z0-9_]/gi, "").toLowerCase(),
        bio: draft.bio.trim(),
        location: draft.location.trim() || "Bloom & Brew Social",
        avatar: getInitials(draft.name) || profile.avatar,
      });
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function cancelEdit() {
    setDraft(profile);
    setIsEditing(false);
    setMessage("");
  }

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
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[6px] bg-[#fff8f2] px-3 py-2">
          <p className="text-lg font-black text-[#211f1d]">
            {currentUser?.stats?.followers ?? 0}
          </p>
          <p className="text-xs font-bold text-[#8a7d73]">Followers</p>
        </div>
        <div className="rounded-[6px] bg-[#fff8f2] px-3 py-2">
          <p className="text-lg font-black text-[#211f1d]">
            {currentUser?.stats?.following ?? 0}
          </p>
          <p className="text-xs font-bold text-[#8a7d73]">Following</p>
        </div>
      </div>
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
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(profile);
              setIsEditing(true);
              setMessage("");
            }}
            className="mt-3 rounded-full border border-[#211f1d] px-4 py-2 text-xs font-black text-[#211f1d] transition hover:bg-[#211f1d] hover:text-white"
          >
            Edit profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8a7d73]">
              Display name
            </span>
            <input
              value={draft.name}
              onChange={(event) =>
                updateDraft({
                  ...draft,
                  name: event.target.value,
                  avatar: getInitials(event.target.value) || draft.avatar,
                })
              }
              className="mt-1 h-10 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
              aria-label="Display name"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8a7d73]">
              Username
            </span>
            <input
              value={draft.username}
              onChange={(event) =>
                updateDraft({
                  ...draft,
                  username: event.target.value.replace(/\s+/g, "").toLowerCase(),
                })
              }
              className="mt-1 h-10 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
              aria-label="Username"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8a7d73]">
              Bio
            </span>
            <textarea
              value={draft.bio}
              onChange={(event) => updateDraft({ ...draft, bio: event.target.value })}
              className="mt-1 min-h-20 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 py-2 text-sm font-bold"
              aria-label="Profile bio"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8a7d73]">
              Location
            </span>
            <input
              value={draft.location}
              onChange={(event) => updateDraft({ ...draft, location: event.target.value })}
              className="mt-1 h-10 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
              aria-label="Location"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void saveProfile();
              }}
              disabled={isSaving}
              className="rounded-full bg-[#211f1d] px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="rounded-full border border-[#211f1d] px-4 py-2 text-xs font-black text-[#211f1d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {message ? (
        <p className="mt-3 rounded-[6px] bg-[#fff8f2] px-3 py-2 text-xs font-bold text-[#6f6259]">
          {message}
        </p>
      ) : null}
    </section>
  );
}
