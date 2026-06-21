import { prisma } from "@/lib/prisma";
import { isExternalSource, type ExternalPostPayload } from "@/lib/external-post-validation";

export { isExternalSource } from "@/lib/external-post-validation";
export type { ExternalPostPayload } from "@/lib/external-post-validation";

export async function upsertExternalPost(post: ExternalPostPayload) {
  if (!isExternalSource(post.source)) {
    throw new Error("External post source must be reddit or youtube.");
  }

  return prisma.externalPost.upsert({
    where: {
      id: post.id,
    },
    update: {
      source: post.source,
      externalUrl: post.externalUrl ?? post.youtubeUrl ?? null,
      title: post.content,
      author: post.author,
      community: post.community,
      imageUrl: post.imageUrl,
      createdAt: new Date(post.createdAt),
    },
    create: {
      id: post.id,
      source: post.source,
      externalUrl: post.externalUrl ?? post.youtubeUrl ?? null,
      title: post.content,
      author: post.author,
      community: post.community,
      imageUrl: post.imageUrl,
      createdAt: new Date(post.createdAt),
    },
  });
}

export async function insertExternalPosts(posts: ExternalPostPayload[]) {
  if (!posts.every((post) => isExternalSource(post.source))) {
    throw new Error("External post source must be reddit or youtube.");
  }

  return prisma.externalPost.createMany({
    data: posts.map((post) => ({
      id: post.id,
      source: post.source,
      externalUrl: post.externalUrl ?? post.youtubeUrl ?? null,
      title: post.content,
      author: post.author,
      community: post.community,
      imageUrl: post.imageUrl,
      createdAt: new Date(post.createdAt),
    })),
    skipDuplicates: true,
  });
}

export async function getExternalPostStatsBatch(postIds: string[], viewer?: string) {
  const [likeCounts, shareCounts, comments, viewerLikes, viewerSaves] = await Promise.all([
    prisma.externalLike.groupBy({
      by: ["externalPostId"],
      where: { externalPostId: { in: postIds } },
      _count: { _all: true },
    }),
    prisma.externalShare.groupBy({
      by: ["externalPostId"],
      where: { externalPostId: { in: postIds } },
      _count: { _all: true },
    }),
    prisma.externalComment.findMany({
      where: { externalPostId: { in: postIds } },
      orderBy: { createdAt: "asc" },
      select: { id: true, externalPostId: true, authorName: true, text: true },
    }),
    viewer
      ? prisma.externalLike.findMany({
          where: { externalPostId: { in: postIds }, userIdentifier: viewer },
          select: { externalPostId: true },
        })
      : [],
    viewer
      ? prisma.externalSavedPost.findMany({
          where: { externalPostId: { in: postIds }, userIdentifier: viewer },
          select: { externalPostId: true },
        })
      : [],
  ]);

  const likesByPost = new Map(likeCounts.map((item) => [item.externalPostId, item._count._all]));
  const sharesByPost = new Map(shareCounts.map((item) => [item.externalPostId, item._count._all]));
  const likedPosts = new Set(viewerLikes.map((item) => item.externalPostId));
  const savedPosts = new Set(viewerSaves.map((item) => item.externalPostId));
  const commentsByPost = new Map<string, Array<{ id: string; author: string; text: string }>>();

  for (const comment of comments) {
    const postComments = commentsByPost.get(comment.externalPostId) ?? [];
    postComments.push({ id: comment.id, author: comment.authorName, text: comment.text });
    commentsByPost.set(comment.externalPostId, postComments);
  }

  return Object.fromEntries(postIds.map((postId) => [postId, {
    likes: likesByPost.get(postId) ?? 0,
    shares: sharesByPost.get(postId) ?? 0,
    liked: likedPosts.has(postId),
    bookmarked: savedPosts.has(postId),
    comments: commentsByPost.get(postId) ?? [],
  }]));
}

export async function getExternalPostStats(postId: string, viewer?: string) {
  const stats = await getExternalPostStatsBatch([postId], viewer);
  return stats[postId];
}
