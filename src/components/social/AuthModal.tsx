type AuthModalProps = {
  authMode: "signin" | "signup";
  authName: string;
  authEmail: string;
  authPassword: string;
  authError: string;
  onClose: () => void;
  onModeChange: (mode: "signin" | "signup") => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function AuthModal({
  authMode,
  authName,
  authEmail,
  authPassword,
  authError,
  onClose,
  onModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#211f1d]/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="w-full max-w-md rounded-[8px] border border-[#eadfd4] bg-white p-6 shadow-[0_24px_80px_rgba(33,31,29,0.3)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
              Bloom & Brew account
            </p>
            <h2 id="auth-title" className="mt-2 text-3xl font-black text-[#211f1d]">
              {authMode === "signin" ? "Sign in" : "Create account"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-2xl font-black text-[#6f6259] hover:bg-[#fff8f2]"
            aria-label="Close auth modal"
          >
            x
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-full bg-[#fff8f2] p-1">
          {(["signin", "signup"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onModeChange(mode)}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                authMode === mode ? "bg-[#211f1d] text-white" : "text-[#211f1d]"
              }`}
            >
              {mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {authMode === "signup" ? (
            <label className="block">
              <span className="text-sm font-black text-[#211f1d]">Display name</span>
              <input
                value={authName}
                onChange={(event) => onNameChange(event.target.value)}
                className="mt-2 h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
                placeholder="Bloom Barista"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-sm font-black text-[#211f1d]">Email</span>
            <input
              type="email"
              value={authEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              className="mt-2 h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#211f1d]">Password</span>
            <input
              type="password"
              value={authPassword}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="mt-2 h-11 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm font-bold"
              placeholder="Password"
            />
          </label>

          {authError ? (
            <p className="rounded-[6px] bg-[#fff8f2] px-3 py-2 text-sm font-bold text-[#c45572]">
              {authError}
            </p>
          ) : null}

          <button
            type="submit"
            className="h-12 w-full rounded-full bg-[#211f1d] text-sm font-black text-white transition hover:bg-[#c45572]"
          >
            {authMode === "signin" ? "Sign in" : "Create account"}
          </button>

          <p className="text-center text-xs font-bold leading-5 text-[#8a7d73]">
            Bloom & Brew is a social experiment and not a real social network.
          </p>
        </form>
      </div>
    </div>
  );
}
