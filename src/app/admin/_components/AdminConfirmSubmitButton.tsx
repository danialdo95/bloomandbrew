"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";

type AdminConfirmSubmitButtonProps = {
  children: ReactNode;
  confirmLabel?: string;
  className: string;
  message: string;
  title?: string;
  warningMessage?: string;
  warningTitle?: string;
};

export function AdminConfirmSubmitButton({
  children,
  confirmLabel = "Delete post",
  className,
  message,
  title = "Confirm deletion",
  warningMessage = "Deleting a post also removes its related engagement records.",
  warningTitle = "Permanent change",
}: AdminConfirmSubmitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <button
        type="submit"
        className={className}
        onClick={(event) => {
          event.preventDefault();
          formRef.current = event.currentTarget.form;
          setIsOpen(true);
        }}
      >
        {children}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-confirm-title"
        >
          <div className="w-full max-w-sm overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_24px_70px_rgba(33,31,29,0.28)]">
            <div className="border-b border-[#f2e8df] bg-[#fffaf6] px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                Admin action
              </p>
              <h2
                id="admin-confirm-title"
                className="mt-2 text-xl font-black text-[#211f1d]"
              >
                {title}
              </h2>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm font-bold leading-6 text-[#6f6259]">
                {message}
              </p>
              <div className="mt-4 rounded-[6px] border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-red-700">
                  {warningTitle}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-red-700">
                  {warningMessage}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#f2e8df] bg-[#fffaf6] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-[6px] border border-[#eadfd4] bg-white px-4 py-2 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  formRef.current?.requestSubmit();
                }}
                className="rounded-[6px] border border-red-200 bg-red-600 px-4 py-2 text-sm font-black text-white transition hover:bg-red-700"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
