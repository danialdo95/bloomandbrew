import type { SocialPost } from "@/types/social";

export type ExternalPostPayload = Pick<
  SocialPost,
  | "id"
  | "externalUrl"
  | "youtubeUrl"
  | "content"
  | "author"
  | "community"
  | "imageUrl"
  | "createdAt"
> & {
  source: "reddit" | "youtube";
};

export function isExternalSource(source: unknown): source is "reddit" | "youtube" {
  return source === "reddit" || source === "youtube";
}

export function isValidExternalPostPayload(post: unknown): post is ExternalPostPayload {
  if (!post || typeof post !== "object") return false;
  const candidate = post as Partial<ExternalPostPayload>;
  const createdAt = typeof candidate.createdAt === "string" ? new Date(candidate.createdAt) : null;

  return Boolean(
    typeof candidate.id === "string" && candidate.id.length > 0 && candidate.id.length <= 200 &&
      isExternalSource(candidate.source) &&
      typeof candidate.content === "string" && candidate.content.length <= 2_000 &&
      typeof candidate.author === "string" && candidate.author.length <= 200 &&
      typeof candidate.community === "string" && candidate.community.length <= 200 &&
      createdAt && !Number.isNaN(createdAt.getTime()),
  );
}
