import { LoadingSpinner } from "@/components/social/LoadingSpinner";
import type { FeedPostPendingAction } from "@/components/social/FeedPost";
import type { SocialPost } from "@/types/social";

type DeletePostModalProps = {
  pendingAction?: FeedPostPendingAction;
  post: SocialPost;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeletePostModal({
  pendingAction,
  post,
  onCancel,
  onConfirm,
}: DeletePostModalProps) {
  const isDeleting = pendingAction === "delete";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-post-title"
      onClick={() => {
        if (!pendingAction) {
          onCancel();
        }
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_24px_80px_rgba(33,31,29,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[#f2e8df] bg-[#fffaf6] px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
            Delete post
          </p>
          <h2
            id="delete-post-title"
            className="mt-2 text-2xl font-black text-[#211f1d]"
          >
            Remove this feed post?
          </h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm font-bold leading-6 text-[#6f6259]">
            This will permanently delete your Bloom & Brew post from the
            public feed. Comments, likes, saves, and shares attached to it
            will also be removed.
          </p>
          <div className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] px-4 py-3">
            <p className="line-clamp-3 text-sm font-bold leading-6 text-[#211f1d]">
              {post.content}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#f2e8df] bg-[#fffaf6] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={Boolean(pendingAction)}
            className="rounded-[6px] border border-[#eadfd4] bg-white px-5 py-2 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={Boolean(pendingAction)}
            className="inline-flex items-center gap-2 rounded-[6px] bg-[#c45572] px-5 py-2 text-sm font-black text-white transition hover:bg-[#211f1d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? <LoadingSpinner className="h-3 w-3" /> : null}
            {isDeleting ? "Deleting..." : "Delete post"}
          </button>
        </div>
      </div>
    </div>
  );
}
