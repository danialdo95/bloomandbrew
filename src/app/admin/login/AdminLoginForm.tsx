"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in to the admin dashboard.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to reach the admin login service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-2 text-sm font-black text-[#211f1d]">
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-12 rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-4 text-base font-bold text-[#211f1d] outline-none transition placeholder:text-[#a69990] focus:border-[#c45572] focus:bg-white"
          placeholder="admin@bloombrew.com"
        />
      </label>

      <label className="grid gap-2 text-sm font-black text-[#211f1d]">
        Password
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="h-12 w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] px-4 pr-16 text-base"
            placeholder="Enter admin password"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {error ? (
        <p className="rounded-[6px] border border-[#f0c8c8] bg-[#fff1f1] px-4 py-3 text-sm font-bold text-[#9f2f42]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 rounded-[6px] bg-[#211f1d] px-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#c45572] disabled:cursor-not-allowed disabled:bg-[#a69990]"
      >
        {isSubmitting ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
