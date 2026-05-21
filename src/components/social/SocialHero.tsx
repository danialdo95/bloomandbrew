import type { DemoUser, SocialProfile } from "@/types/social";

type SocialHeroProps = {
  isAuthenticated: boolean;
  profile: SocialProfile;
  currentUser: DemoUser | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
};

export function SocialHero({
  isAuthenticated,
  profile,
  onSignIn,
  onSignUp,
  onSignOut,
}: SocialHeroProps) {
  return (
    <section className="border-b border-[#eadfd4] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-5 md:py-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#c45572]">
          Join the social feed
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight text-[#211f1d] md:text-6xl">
              Bloom & Brew is now a social feed for cafe and floral culture.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6f6259]">
              Create posts, personalize a profile, follow creators, react,
              comment, share, chat, go live, tag locations, and browse a
              Reddit-powered news feed.
            </p>
          </div>

          <div className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] p-4">
            {isAuthenticated ? (
              <>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                  Signed in as
                </p>
                <p className="mt-2 text-2xl font-black text-[#211f1d]">
                  {profile.name}
                </p>
                <p className="text-sm font-bold text-[#8a7d73]">@{profile.username}</p>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="mt-4 rounded-full border border-[#211f1d] px-4 py-2 text-sm font-black text-[#211f1d] transition hover:bg-[#211f1d] hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                  Join the social feed
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#6f6259]">
                  Sign in or create an account to post, comment, follow,
                  chat, save, and go live.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="rounded-full bg-[#211f1d] px-4 py-2 text-sm font-black text-white"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="rounded-full border border-[#211f1d] bg-white px-4 py-2 text-sm font-black text-[#211f1d]"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
