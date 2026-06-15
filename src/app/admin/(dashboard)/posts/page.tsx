import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AdminConfirmSubmitButton } from "@/app/admin/_components/AdminConfirmSubmitButton";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { AdminPagination } from "@/app/admin/_components/AdminPagination";
import {
  formatAdminDate,
  getAdminPosts,
  normalizeAdminPage,
  truncateAdminText,
} from "@/app/admin/_lib/admin-data";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminPostsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    page?: string;
    updated?: string;
  }>;
};

async function ensureAdminAction() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    redirect("/admin/login");
  }
}

function getReturnTo(value: FormDataEntryValue | null, fallback = "/admin/posts") {
  return typeof value === "string" && value.startsWith("/admin/posts")
    ? value
    : fallback;
}

function withFeedback(path: string, feedback: string) {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString);
  params.set("updated", feedback);

  return `${pathname}?${params.toString()}`;
}

function getStatusBadge(status: string) {
  return status === "VISIBLE"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-800";
}

function getFeedbackMessage(value?: string) {
  if (value === "hidden") {
    return "Post was hidden from the public feed.";
  }

  if (value === "visible") {
    return "Post was restored to the public feed.";
  }

  if (value === "deleted") {
    return "Post was permanently deleted.";
  }

  return "";
}

async function deletePost(formData: FormData) {
  "use server";

  await ensureAdminAction();

  const postId = formData.get("postId");
  const returnTo = getReturnTo(formData.get("returnTo"));

  if (typeof postId !== "string") {
    return;
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/admin/posts");
  redirect(withFeedback(returnTo, "deleted"));
}

async function updatePostStatus(formData: FormData) {
  "use server";

  await ensureAdminAction();

  const postId = formData.get("postId");
  const status = formData.get("status");
  const returnTo = getReturnTo(formData.get("returnTo"));

  if (typeof postId !== "string" || typeof status !== "string") {
    return;
  }

  if (status !== "VISIBLE" && status !== "HIDDEN") {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status },
  });

  revalidatePath("/admin/posts");
  redirect(withFeedback(returnTo, status === "VISIBLE" ? "visible" : "hidden"));
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const status = params?.status === "visible" || params?.status === "hidden"
    ? params.status
    : "all";
  const page = normalizeAdminPage(params?.page);
  const { posts, pagination } = await getAdminPosts({ page, query, status });
  const feedback = getFeedbackMessage(params?.updated);
  const baseParams = new URLSearchParams();

  if (query) {
    baseParams.set("q", query);
  }

  if (status !== "all") {
    baseParams.set("status", status);
  }

  if (page > 1) {
    baseParams.set("page", String(page));
  }

  const returnTo = `/admin/posts${baseParams.toString() ? `?${baseParams.toString()}` : ""}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Post management"
        title="Recent Bloom posts"
        description="Search database-backed posts, filter by moderation status, and remove inappropriate content from the public feed."
        aside={`${pagination.total.toLocaleString()} posts`}
      />

      {feedback ? (
        <p className="mt-5 rounded-[6px] border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700">
          {feedback}
        </p>
      ) : null}

      <section className="mt-5 rounded-[6px] border border-[#eadfd4] bg-white p-4 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <form className="grid gap-3 lg:grid-cols-[1fr_180px_auto_auto] lg:items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search content, author, username, or community"
            className="h-10 rounded-[6px] border border-[#eadfd4] px-4 text-sm font-bold text-[#211f1d] outline-none transition placeholder:text-[#a69990] focus:border-[#c45572]"
          />
          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-[6px] border border-[#eadfd4] bg-white px-4 text-sm font-black text-[#211f1d] outline-none transition focus:border-[#c45572]"
          >
            <option value="all">All statuses</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-[6px] bg-[#211f1d] px-4 text-sm font-black text-white transition hover:bg-[#c45572]"
          >
            Apply
          </button>
          {query || status !== "all" ? (
            <a
              href="/admin/posts"
              className="flex h-10 items-center justify-center rounded-[6px] border border-[#eadfd4] px-4 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
            >
              Clear
            </a>
          ) : null}
        </form>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
          {pagination.total.toLocaleString()} result
          {pagination.total === 1 ? "" : "s"}
          {query ? ` for "${query}"` : ""}
          {status !== "all" ? ` with ${status} status` : ""}
        </p>
      </section>

      <section className="mt-5 overflow-hidden rounded-[6px] border border-[#eadfd4] bg-white shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="divide-y divide-[#f2e8df]">
          {posts.map((post) => (
            <article key={post.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-black text-[#211f1d]">{post.author.name}</p>
                  <p className="mt-1 text-xs font-bold text-[#8a7d73]">
                    @{post.author.username} · {formatAdminDate(post.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#c45572]">
                    {post.community}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadge(post.status)}`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#6f6259]">
                {truncateAdminText(post.content, 180)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-black text-[#211f1d] sm:grid-cols-4">
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

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[6px] bg-[#fffaf6] p-3">
                <p className="text-xs font-bold leading-5 text-[#6f6259]">
                  Hide removes this post from the public feed. Delete permanently
                  removes it and its related engagement records.
                </p>
                <div className="flex flex-wrap gap-2">
                  <form action={updatePostStatus}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={post.status === "VISIBLE" ? "HIDDEN" : "VISIBLE"}
                    />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button
                      type="submit"
                      className={
                        post.status === "VISIBLE"
                          ? "rounded-[6px] border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-black text-yellow-800 transition hover:border-yellow-500"
                          : "rounded-[6px] border border-green-200 bg-green-50 px-3 py-2 text-xs font-black text-green-700 transition hover:border-green-400"
                      }
                    >
                      {post.status === "VISIBLE" ? "Hide" : "Restore"}
                    </button>
                  </form>

                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <AdminConfirmSubmitButton
                      title="Delete this post?"
                      message="This post will be permanently removed from Bloom & Brew Social. This cannot be undone."
                      confirmLabel="Delete permanently"
                      className="rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:border-red-400"
                    >
                      Delete
                    </AdminConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </article>
          ))}

          {!posts.length ? (
            <p className="px-5 py-8 text-center text-sm font-bold text-[#8a7d73]">
              {query || status !== "all"
                ? "No posts match these filters."
                : "No Bloom posts yet."}
            </p>
          ) : null}
        </div>

        <AdminPagination
          basePath="/admin/posts"
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.pageSize}
          params={{ q: query, status: status === "all" ? undefined : status }}
        />
      </section>
    </>
  );
}
