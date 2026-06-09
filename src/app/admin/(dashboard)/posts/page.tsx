import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import {
  formatAdminDate,
  getAdminPosts,
  truncateAdminText,
} from "@/app/admin/_lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <>
      <AdminPageHeader
        eyebrow="Post management"
        title="Recent Bloom posts"
        description="Review database-backed user posts and their engagement signals before moderation controls are added."
        aside="Moderation planned"
      />

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="divide-y divide-[#f2e8df]">
          {posts.map((post) => (
            <article key={post.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#211f1d]">{post.author.name}</p>
                  <p className="text-xs font-bold text-[#8a7d73]">
                    @{post.author.username} · {formatAdminDate(post.createdAt)}
                  </p>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#c45572]">
                  {post.community}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#6f6259]">
                {truncateAdminText(post.content, 140)}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-black text-[#211f1d] sm:grid-cols-4">
                <span className="rounded-[6px] bg-[#fff8f2] px-2 py-2">
                  {post._count.likes} likes
                </span>
                <span className="rounded-[6px] bg-[#fff8f2] px-2 py-2">
                  {post._count.comments} comments
                </span>
                <span className="rounded-[6px] bg-[#fff8f2] px-2 py-2">
                  {post._count.savedBy} saves
                </span>
                <span className="rounded-[6px] bg-[#fff8f2] px-2 py-2">
                  {post._count.shares} shares
                </span>
              </div>
            </article>
          ))}
          {!posts.length ? (
            <p className="px-5 py-6 text-center text-sm font-bold text-[#8a7d73]">
              No Bloom posts yet.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
