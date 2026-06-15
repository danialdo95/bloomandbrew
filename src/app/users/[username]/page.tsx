import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicProfileFollowButton } from "@/components/social/PublicProfileFollowButton";
import { filterClasses, filterStyles, getTimeLabel } from "@/lib/social";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getYouTubeVideoId, getYouTubeWatchUrl } from "@/lib/youtube-url";

type UserProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const normalizedUsername = decodeURIComponent(username).toLowerCase();
  const currentUser = await getCurrentUser();

  const user = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      posts: {
        include: {
          comments: {
            orderBy: {
              createdAt: "asc",
            },
          },
          likes: true,
          savedBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isFollowing = currentUser
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: user.id,
          },
        },
      })
    : null;

  const isSelf = currentUser?.id === user.id;

  return (
    <main className="min-h-screen bg-[#fffaf6]">
      <section className="border-b border-[#eadfd4] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-5">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-[0.16em] text-[#c45572] hover:underline"
          >
            Back to feed
          </Link>

          <div className="mt-6 flex flex-col gap-5 rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)] md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-2xl font-black text-[#211f1d]">
                {user.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#211f1d]">{user.name}</h1>
                <p className="mt-1 text-sm font-bold text-[#8a7d73]">@{user.username}</p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6f6259]">
                  {user.bio ?? "Bloom & Brew member."}
                </p>
                <p className="mt-3 text-sm font-bold text-[#c45572]">
                  📍 {user.location ?? "Bloom & Brew Social"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-black text-[#211f1d]">
                  <span>{user._count.followers.toLocaleString()} followers</span>
                  <span>{user._count.following.toLocaleString()} following</span>
                  <span>{user.posts.length.toLocaleString()} posts</span>
                </div>
              </div>
            </div>

            <PublicProfileFollowButton
              userId={user.id}
              username={user.username}
              initialIsFollowing={Boolean(isFollowing)}
              canFollow={Boolean(currentUser)}
              isSelf={isSelf}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-5">
        {user.posts.length ? (
          user.posts.map((post) => {
            const youtubeVideoId = getYouTubeVideoId(post.imageUrl);
            const youtubeUrl = youtubeVideoId ? getYouTubeWatchUrl(youtubeVideoId) : null;

            return (
              <article
                key={post.id}
                className="rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]"
              >
              <div className="flex items-start gap-3 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black">
                  {user.avatar}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-[#211f1d]">{user.name}</h2>
                    <span className="text-sm font-bold text-[#8a7d73]">
                      @{user.username}
                    </span>
                    <span className="text-sm font-bold text-[#8a7d73]">
                      · {getTimeLabel(post.createdAt.toISOString())}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#c45572]">
                    {post.community} · {post.location ?? "Bloom & Brew Social"}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-[#211f1d]">
                    {post.content}
                  </p>
                </div>
              </div>

              {youtubeVideoId ? (
                <div className="px-5 pb-4">
                  <div className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-[#211f1d]">
                    <iframe
                      className="aspect-video w-full"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0`}
                      title={post.content}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  {youtubeUrl ? (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-black text-[#c45572] hover:underline"
                    >
                      Watch on YouTube
                    </a>
                  ) : null}
                </div>
              ) : post.imageUrl ? (
                <div className="px-5 pb-4">
                  <div className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-[#fff8f2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt=""
                      className={`max-h-[520px] w-full object-cover ${filterClasses[post.filter]}`}
                      style={filterStyles[post.filter] ?? filterStyles.Natural}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-3 border-t border-[#eadfd4] text-center text-sm font-black text-[#6f6259]">
                <span className="px-3 py-3">{post.likes.length.toLocaleString()} likes</span>
                <span className="px-3 py-3">
                  {post.comments.length.toLocaleString()} comments
                </span>
                <span className="px-3 py-3">
                  {post.savedBy.length.toLocaleString()} saves
                </span>
              </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[6px] border border-dashed border-[#d8c8bc] bg-white p-8 text-center shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
            <h2 className="text-xl font-black text-[#211f1d]">No posts yet</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6259]">
              @{user.username} has not shared a Bloom & Brew post yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
