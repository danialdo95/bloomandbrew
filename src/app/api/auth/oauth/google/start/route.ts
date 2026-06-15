import { NextResponse } from "next/server";

import {
  createOAuthState,
  getGoogleRedirectUri,
  getOAuthErrorRedirect,
  setOAuthStateCookie,
} from "@/lib/google-oauth";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      getOAuthErrorRedirect(request, "Google OAuth is not configured."),
    );
  }

  const state = createOAuthState();
  await setOAuthStateCookie(state);

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", getGoogleRedirectUri(request));
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authorizationUrl);
}
