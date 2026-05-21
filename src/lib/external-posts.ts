import { prisma } from "@/lib/prisma";
import type { SocialPost } from "@/types/social";

export type ExternalPostPayload = Pick<
  SocialPost,
  | "id"
  | "source"
  | "externalUrl"
  | "youtubeUrl"
  | "content"
  | "author"
  | "community"
  | "imageUrl"
  | "createdAt"
>;

export function isExternalSource(source: unknown): source is "reddit" | "youtube" {
  return source === "reddit" || source === "youtube";
}

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

export async function getExternalPostStats(postId: string, viewer?: string) {
  const [likes, saved, comments, shares] = await Promise.all([
    prisma.externalLike.findMany({
      where: {
        externalPostId: postId,
      },
      select: {
        userIdentifier: true,
      },
    }),
    viewer
      ? prisma.externalSavedPost.findUnique({
          where: {
            externalPostId_userIdentifier: {
              externalPostId: postId,
              userIdentifier: viewer,
            },
          },
        })
      : null,
    prisma.externalComment.findMany({
      where: {
        externalPostId: postId,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.externalShare.count({
      where: {
        externalPostId: postId,
      },
    }),
  ]);

  return {
    likes: likes.length,
    shares,
    liked: viewer ? likes.some((like) => like.userIdentifier === viewer) : false,
    bookmarked: Boolean(saved),
    comments: comments.map((comment) => ({
      id: comment.id,
      author: comment.authorName,
      text: comment.text,
    })),
  };
}
