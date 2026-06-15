type DisabledAccountModalProps = {
  message: string;
  onDismiss: () => void;
};

export function DisabledAccountModal({
  message,
  onDismiss,
}: DisabledAccountModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disabled-account-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_24px_80px_rgba(33,31,29,0.3)]">
        <div className="border-b border-[#f2e8df] bg-[#fffaf6] px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
            Account notice
          </p>
          <h2
            id="disabled-account-title"
            className="mt-2 text-2xl font-black text-[#211f1d]"
          >
            Account disabled
          </h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm font-bold leading-6 text-[#6f6259]">
            {message}
          </p>
          <p className="mt-3 rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] px-4 py-3 text-sm font-bold leading-6 text-[#6f6259]">
            You have been signed out and cannot use authenticated actions
            until an administrator reactivates the account.
          </p>
        </div>
        <div className="flex justify-end border-t border-[#f2e8df] bg-[#fffaf6] px-6 py-4">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-[6px] bg-[#211f1d] px-5 py-2 text-sm font-black text-white transition hover:bg-[#c45572]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
