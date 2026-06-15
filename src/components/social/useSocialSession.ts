"use client";

import { useCallback, useEffect, useState } from "react";

import { defaultProfile } from "@/lib/social";
import type { DemoUser, SocialProfile } from "@/types/social";

type AuthMode = "signin" | "signup";

type AuthMeResponse = {
  disabledAccount?: boolean;
  error?: string;
  user: DemoUser | null;
};

type UseSocialSessionOptions = {
  onSessionReset: () => void;
  onAuthNotice: (message: string) => void;
};

export function useSocialSession({
  onSessionReset,
  onAuthNotice,
}: UseSocialSessionOptions) {
  const [storageReady, setStorageReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<SocialProfile>(defaultProfile);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [disabledAccountMessage, setDisabledAccountMessage] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAuthenticated = Boolean(currentUser);

  const clearAuthForm = useCallback(() => {
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
  }, []);

  const openAuth = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    if (isAuthSubmitting) {
      return;
    }

    setAuthOpen(false);
    setAuthError("");
  }, [isAuthSubmitting]);

  const changeAuthMode = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError("");
  }, []);

  const handleDisabledAccount = useCallback(
    (message: string) => {
      setCurrentUser(null);
      setProfile(defaultProfile);
      onSessionReset();
      setAuthOpen(false);
      setAuthError("");
      setDisabledAccountMessage(message);
    },
    [onSessionReset],
  );

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me");
        const data = (await response.json()) as AuthMeResponse;

        if (data.user) {
          setCurrentUser(data.user);
          setProfile(data.user.profile);
        } else if (data.disabledAccount) {
          handleDisabledAccount(
            data.error ?? "Your account has been disabled. Please contact an administrator.",
          );
        }
      } catch (error) {
        console.error(error);
      }

      setStorageReady(true);
    }

    loadSession();
  }, [handleDisabledAccount]);

  useEffect(() => {
    const authErrorParam = new URLSearchParams(window.location.search).get("authError");

    if (!authErrorParam) {
      return;
    }

    queueMicrotask(() => {
      setAuthMode("signin");
      setAuthOpen(true);
      setAuthError(authErrorParam);
    });

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("authError");
    window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch("/api/auth/me");
        const data = (await response.json()) as AuthMeResponse;

        if (data.disabledAccount) {
          handleDisabledAccount(
            data.error ?? "Your account has been disabled. Please contact an administrator.",
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    window.addEventListener("focus", verifySession);

    return () => {
      window.removeEventListener("focus", verifySession);
    };
  }, [currentUser, handleDisabledAccount]);

  const requireAuth = useCallback(
    (action: string) => {
      if (isAuthenticated) {
        return true;
      }

      setAuthError(`Please sign in or create an account to ${action}.`);
      openAuth("signin");
      return false;
    },
    [isAuthenticated, openAuth],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setIsAuthSubmitting(true);
      setAuthError("");

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        });
        const data = (await response.json()) as { user?: DemoUser; error?: string };

        if (!response.ok || !data.user) {
          throw new Error(data.error ?? "Account could not be created.");
        }

        setCurrentUser(data.user);
        setProfile(data.user.profile);
        setAuthOpen(false);
        clearAuthForm();
        onAuthNotice("Account created. Welcome to Bloom & Brew Social.");
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : "Account could not be created.",
        );
      } finally {
        setIsAuthSubmitting(false);
      }
    },
    [clearAuthForm, onAuthNotice],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsAuthSubmitting(true);
      setAuthError("");

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const data = (await response.json()) as { user?: DemoUser; error?: string };

        if (!response.ok || !data.user) {
          throw new Error(data.error ?? "Invalid email or password.");
        }

        setCurrentUser(data.user);
        setProfile(data.user.profile);
        setAuthOpen(false);
        clearAuthForm();
        onAuthNotice("Signed in successfully.");
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : "Invalid email or password.");
      } finally {
        setIsAuthSubmitting(false);
      }
    },
    [clearAuthForm, onAuthNotice],
  );

  const handleAuthSubmit = useCallback(() => {
    if (isAuthSubmitting) {
      return;
    }

    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();
    const name = authName.trim();

    if (!email || !password || (authMode === "signup" && !name)) {
      setAuthError("Fill in all required fields.");
      return;
    }

    if (authMode === "signup") {
      void signUp(email, password, name);
      return;
    }

    void signIn(email, password);
  }, [
    authEmail,
    authMode,
    authName,
    authPassword,
    isAuthSubmitting,
    signIn,
    signUp,
  ]);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setCurrentUser(null);
      setProfile(defaultProfile);
      onSessionReset();
      onAuthNotice("Signed out of your account.");
    } finally {
      setIsSigningOut(false);
    }
  }, [onAuthNotice, onSessionReset]);

  const updateProfile = useCallback(
    async (nextProfile: SocialProfile) => {
      if (!currentUser) {
        throw new Error("Sign in to edit your profile.");
      }

      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextProfile),
      });
      const data = (await response.json()) as { user?: DemoUser; error?: string };

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Profile could not be saved.");
      }

      setCurrentUser(data.user);
      setProfile(data.user.profile);
      onAuthNotice("Profile saved.");
    },
    [currentUser, onAuthNotice],
  );

  return {
    authEmail,
    authError,
    authMode,
    authName,
    authOpen,
    authPassword,
    changeAuthMode,
    closeAuth,
    currentUser,
    disabledAccountMessage,
    dismissDisabledAccount: () => setDisabledAccountMessage(""),
    handleAuthSubmit,
    isAuthenticated,
    isAuthSubmitting,
    isSigningOut,
    openAuth,
    profile,
    requireAuth,
    setAuthEmail,
    setAuthName,
    setAuthPassword,
    setCurrentUser,
    signOut,
    storageReady,
    updateProfile,
  };
}
