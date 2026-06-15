import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export const GOOGLE_OAUTH_STATE_COOKIE = "bloom_brew_google_oauth_state";

export type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub?: string;
};

export function getAppUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (configuredUrl) {
    return configuredUrl;
  }

  return new URL(request.url).origin;
}

export function getGoogleRedirectUri(request: Request) {
  return `${getAppUrl(request)}/api/auth/oauth/google/callback`;
}

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export async function setOAuthStateCookie(state: string) {
  const cookieStore = await cookies();

  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
}

export async function consumeOAuthStateCookie() {
  const cookieStore = await cookies();
  const state = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value ?? "";

  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

  return state;
}

export function getOAuthErrorRedirect(request: Request, error: string) {
  const redirectUrl = new URL(getAppUrl(request));
  redirectUrl.searchParams.set("authError", error);

  return redirectUrl;
}
