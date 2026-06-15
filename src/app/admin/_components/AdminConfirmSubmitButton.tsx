"use client";

import type { ReactNode } from "react";

type AdminConfirmSubmitButtonProps = {
  children: ReactNode;
  className: string;
  message: string;
};

export function AdminConfirmSubmitButton({
  children,
  className,
  message,
}: AdminConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
