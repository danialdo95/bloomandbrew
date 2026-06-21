"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { FeedPostPendingAction } from "@/components/social/FeedPost";
import {
  type ExternalPostStats,
  isDatabasePost,
  isExternalPost,
  sortPostsByAge,
  toExternalPostPayload,
} from "@/components/social/useFeedPosts";
import type { DemoUser, PostShareMethod, SocialPost, SocialProfile } from "@/types/social";

type UsePostActionsOptions = {
  addNotification: (message: string) => void;
  currentUser: DemoUser | null;
  posts: SocialPost[];
  profile: SocialProfile;
  requireAuth: (action: string) => boolean;
  setLatestBloomPostAt: (value: string) => void;
  setPosts: Dispatch<SetStateAction<SocialPost[]>>;
};

export function usePostActions({
  addNotification,
  currentUser,
  posts,
  profile,
  requireAuth,
  setLatestBloomPostAt,
  setPosts,
}: UsePostActionsOptions) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filter, setFilter] = useState("Natural");
  const [location, setLocation] = useState("Bloom & Brew Social");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [postPendingDelete, setPostPendingDelete] = useState<SocialPost | null>(null);
  const [pendingPostActions, setPendingPostActions] = useState<
    Record<string, Exclude<FeedPostPendingAction, null>>
  >({});
  const [isPublishing, setIsPublishing] = useState(false);

  function setPostPending(postId: string, action: Exclude<FeedPostPendingAction, null>) {
    setPendingPostActions((current) => ({ ...current, [postId]: action }));
  }

  function clearPostPending(postId: string) {
    setPendingPostActions((current) => {
      const next = { ...current };
      delete next[postId];
      return next;
    });
  }

  async function publishPost() {
    if (!requireAuth("share posts")) {
      return;
    }

    if (!content.trim() && !imageUrl.trim()) {
      return;
    }

    setIsPublishing(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          imageUrl,
          filter,
          location,
          profile,
        }),
      });

      const data = (await response.json()) as { post?: SocialPost; error?: string };

      if (!response.ok || !data.post) {
        throw new Error(data.error ?? "Post could not be shared.");
      }

      setPosts((current) => sortPostsByAge([
        data.post as SocialPost,
        ...current.filter((post) => post.id !== data.post?.id),
      ]));
      setLatestBloomPostAt((data.post as SocialPost).createdAt);
      setContent("");
      setImageUrl("");
      setFilter("Natural");
      addNotification("Your post was shared to the Bloom & Brew feed.");
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Post could not be shared.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function toggleLike(postId: string) {
    if (!requireAuth("like posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;
    setPostPending(postId, "like");

    if (isPostInDatabase) {
      try {
        const response = await fetch(`/api/posts/${postId}/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile,
          }),
        });
        const data = (await response.json()) as {
          liked?: boolean;
          likes?: number;
          error?: string;
        };

        if (!response.ok || typeof data.liked !== "boolean" || typeof data.likes !== "number") {
          throw new Error(data.error ?? "Like could not be recorded.");
        }

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  liked: data.liked as boolean,
                  likes: data.likes as number,
                }
              : post,
          ),
        );
        addNotification(data.liked ? "Post liked." : "Post unliked.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Like could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    if (targetPost && isExternalPost(targetPost)) {
      try {
        const response = await fetch(`/api/external-posts/${postId}/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post: toExternalPostPayload(targetPost),
          }),
        });
        const data = (await response.json()) as Partial<ExternalPostStats> & {
          error?: string;
        };

        if (!response.ok || typeof data.liked !== "boolean" || typeof data.likes !== "number") {
          throw new Error(data.error ?? "Like could not be recorded.");
        }

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.likes - (post.persistedLikeCount ?? 0) + (data.likes as number),
                  persistedLikeCount: data.likes as number,
                  liked: data.liked as boolean,
                }
              : post,
          ),
        );
        addNotification(data.liked ? "Post liked." : "Post unliked.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Like could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
    addNotification("A feed interaction was recorded.");
    clearPostPending(postId);
  }

  async function toggleBookmark(postId: string) {
    if (!requireAuth("save posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;
    setPostPending(postId, "bookmark");

    if (isPostInDatabase) {
      try {
        const response = await fetch(`/api/posts/${postId}/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile,
          }),
        });
        const data = (await response.json()) as {
          bookmarked?: boolean;
          error?: string;
        };

        if (!response.ok || typeof data.bookmarked !== "boolean") {
          throw new Error(data.error ?? "Save could not be recorded.");
        }

        const bookmarked = data.bookmarked;

        setPosts((current) =>
          current.map((post) =>
            post.id === postId ? { ...post, bookmarked } : post,
          ),
        );
        addNotification(bookmarked ? "Post saved." : "Post removed from saved.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Save could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    if (targetPost && isExternalPost(targetPost)) {
      try {
        const response = await fetch(`/api/external-posts/${postId}/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post: toExternalPostPayload(targetPost),
          }),
        });
        const data = (await response.json()) as Partial<ExternalPostStats> & {
          error?: string;
        };

        if (!response.ok || typeof data.bookmarked !== "boolean") {
          throw new Error(data.error ?? "Save could not be recorded.");
        }

        setPosts((current) =>
          current.map((post) =>
            post.id === postId ? { ...post, bookmarked: data.bookmarked as boolean } : post,
          ),
        );
        addNotification(data.bookmarked ? "Post saved." : "Post removed from saved.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Save could not be recorded.",
        );
        clearPostPending(postId);
        return;
      }
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
      ),
    );
    clearPostPending(postId);
  }

  async function sharePost(postId: string, method: PostShareMethod = "copy") {
    if (!requireAuth("share posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    const endpoint = isExternalPost(targetPost)
      ? `/api/external-posts/${postId}/shares`
      : `/api/posts/${postId}/shares`;

    setPostPending(postId, "share");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isExternalPost(targetPost)
            ? {
                post: toExternalPostPayload(targetPost),
              }
            : {},
        ),
      });
      const data = (await response.json()) as {
        shares?: number;
        error?: string;
      };

      if (!response.ok || typeof data.shares !== "number") {
        throw new Error(data.error ?? "Share could not be recorded.");
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                shares: isExternalPost(post)
                  ? post.shares - (post.persistedShareCount ?? 0) + (data.shares as number)
                  : data.shares as number,
                persistedShareCount: isExternalPost(post)
                  ? data.shares as number
                  : post.persistedShareCount,
              }
            : post,
        ),
      );
      addNotification(getShareNotification(method));
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Share could not be recorded.",
      );
    } finally {
      clearPostPending(postId);
    }
  }

  async function addComment(postId: string) {
    if (!requireAuth("comment")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const text = commentDrafts[postId]?.trim();

    if (!text) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isPostInDatabase = targetPost ? isDatabasePost(targetPost) : false;
    setPostPending(postId, "comment");

    if (isPostInDatabase) {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            profile,
          }),
        });
        const data = (await response.json()) as {
          comment?: SocialPost["comments"][number];
          error?: string;
        };

        if (!response.ok || !data.comment) {
          throw new Error(data.error ?? "Comment could not be added.");
        }

        const savedComment = data.comment;

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, savedComment],
                  commentCount: (post.commentCount ?? post.comments.length) + 1,
                }
              : post,
          ),
        );
        setCommentDrafts((current) => ({ ...current, [postId]: "" }));
        addNotification("Your comment was saved to the database.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Comment could not be added.",
        );
        clearPostPending(postId);
        return;
      }
    }

    if (targetPost && isExternalPost(targetPost)) {
      try {
        const response = await fetch(`/api/external-posts/${postId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            post: toExternalPostPayload(targetPost),
          }),
        });
        const data = (await response.json()) as {
          comment?: SocialPost["comments"][number];
          error?: string;
        };

        if (!response.ok || !data.comment) {
          throw new Error(data.error ?? "Comment could not be added.");
        }

        const savedComment = data.comment;

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, savedComment],
                }
              : post,
          ),
        );
        setCommentDrafts((current) => ({ ...current, [postId]: "" }));
        addNotification("Your comment was saved to the database.");
        clearPostPending(postId);
        return;
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Comment could not be added.",
        );
        clearPostPending(postId);
        return;
      }
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: crypto.randomUUID(),
                  author: profile.name,
                  text,
                },
              ],
            }
          : post,
      ),
    );
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    addNotification("Your comment was added.");
    clearPostPending(postId);
  }

  function requestDeletePost(postId: string) {
    if (!requireAuth("delete posts")) {
      return;
    }

    if (pendingPostActions[postId]) {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost || !canDeletePost(targetPost, currentUser)) {
      addNotification("You can only delete your own Bloom & Brew posts.");
      return;
    }

    setPostPendingDelete(targetPost);
  }

  async function confirmDeletePost() {
    const targetPost = postPendingDelete;

    if (!targetPost) {
      return;
    }

    const postId = targetPost.id;

    setPostPending(postId, "delete");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };

      if (!response.ok || !data.deleted) {
        throw new Error(data.error ?? "Post could not be deleted.");
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
      setPostPendingDelete(null);
      addNotification("Post deleted.");
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Post could not be deleted.",
      );
    } finally {
      clearPostPending(postId);
    }
  }

  return {
    addComment,
    commentDrafts,
    confirmDeletePost,
    content,
    filter,
    imageUrl,
    isPublishing,
    location,
    pendingPostActions,
    postPendingDelete,
    requestDeletePost,
    setCommentDrafts,
    setContent,
    setFilter,
    setImageUrl,
    setLocation,
    setPostPendingDelete,
    sharePost,
    toggleBookmark,
    toggleLike,
    publishPost,
  };
}

export function canDeletePost(post: SocialPost, user: DemoUser | null) {
  return post.source === "bloom" && Boolean(user) && post.username === user?.profile.username;
}

function getShareNotification(method: PostShareMethod) {
  const labels: Record<PostShareMethod, string> = {
    native: "Post shared through your device share menu.",
    copy: "Post link copied and share activity recorded.",
    facebook: "Post opened for Facebook sharing.",
    messenger: "Post opened for Messenger sharing.",
    email: "Post prepared for email sharing.",
    whatsapp: "Post opened for WhatsApp sharing.",
  };

  return labels[method];
}
