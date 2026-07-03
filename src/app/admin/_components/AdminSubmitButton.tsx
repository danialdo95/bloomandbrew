"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function AdminSpinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

type AdminSubmitButtonProps = {
  children: ReactNode;
  className: string;
  disabled?: boolean;
  pendingLabel?: string;
  title?: string;
};

/**
 * Submit button that reflects the pending state of its parent server-action
 * form via `useFormStatus`. It disables itself and shows an inline spinner
 * while the action is in flight, so admin moderation actions give immediate
 * feedback during the server round-trip.
 */
export function AdminSubmitButton({
  children,
  className,
  disabled = false,
  pendingLabel,
  title,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      title={title}
      aria-busy={pending}
      className={className}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {pending ? <AdminSpinner /> : null}
        {pending && pendingLabel ? pendingLabel : children}
      </span>
    </button>
  );
}
