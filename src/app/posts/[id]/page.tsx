import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { filterClasses, filterStyles, getTimeLabel } from "@/lib/social";
import { prisma } from "@/lib/prisma";
import { getYouTubeVideoId, getYouTubeWatchUrl } from "@/lib/youtube-url";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getVisiblePost(id: string) {
  const post = await prisma.post.findFirst({
    where: {
      id,
      status: "VISIBLE",
    },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          avatar: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          shares: true,
          savedBy: true,
        },
      },
    },
  });

  return post;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getVisiblePost(id);

  if (!post) {
    return {
      title: "Post not found · Bloom & Brew Social",
    };
  }

  const snippet = post.content.length > 140
    ? `${post.content.slice(0, 137)}…`
    : post.content;
  const title = `${post.author.name} on Bloom & Brew Social`;

  return {
    title,
    description: snippet,
    openGraph: {
      title,
      description: snippet,
      type: "article",
      images: post.imageUrl && !getYouTubeVideoId(post.imageUrl) ? [post.imageUrl] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getVisiblePost(id);

  if (!post) {
    notFound();
  }

  const youtubeVideoId = getYouTubeVideoId(post.imageUrl);
  const youtubeUrl = youtubeVideoId ? getYouTubeWatchUrl(youtubeVideoId) : null;
  const profileHref = `/users/${post.author.username}`;

  return (
    <main className="min-h-screen bg-[#fffaf6]">
      <section className="border-b border-[#eadfd4] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-5">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-[0.16em] text-[#c45572] hover:underline"
          >
            Back to feed
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-6 md:px-5">
        <article className="overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
          <div className="flex items-start gap-3 p-5">
            <Link
              href={profileHref}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-sm font-black text-[#211f1d]"
            >
              {post.author.avatar}
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={profileHref} className="font-black text-[#211f1d] hover:underline">
                  {post.author.name}
                </Link>
                <span className="text-sm font-bold text-[#8a7d73]">
                  @{post.author.username}
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
                  loading="lazy"
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
                  decoding="async"
                  src={post.imageUrl}
                  alt=""
                  className={`max-h-[520px] w-full object-cover ${filterClasses[post.filter]}`}
                  style={filterStyles[post.filter] ?? filterStyles.Natural}
                />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 border-t border-[#eadfd4] text-center text-sm font-black text-[#6f6259]">
            <span className="px-3 py-3">{post._count.likes.toLocaleString()} likes</span>
            <span className="px-3 py-3">{post._count.comments.toLocaleString()} comments</span>
            <span className="px-3 py-3">{post._count.savedBy.toLocaleString()} saves</span>
          </div>
        </article>

        <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#c45572]">
            Comments
          </h2>

          {post.comments.length ? (
            <ul className="mt-4 space-y-4">
              {post.comments.map((comment) => (
                <li key={comment.id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7c6cf] text-xs font-black text-[#211f1d]">
                    {comment.authorAvatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-[#211f1d]">
                        {comment.authorName}
                      </span>
                      <span className="text-xs font-bold text-[#8a7d73]">
                        @{comment.authorUsername}
                      </span>
                      <span className="text-xs font-bold text-[#8a7d73]">
                        · {getTimeLabel(comment.createdAt.toISOString())}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#211f1d]">
                      {comment.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm font-bold leading-6 text-[#6f6259]">
              No comments yet. Open this post in the feed to join the conversation.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
