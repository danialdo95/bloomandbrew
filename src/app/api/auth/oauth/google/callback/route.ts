import { NextResponse } from "next/server";

import {
  createSession,
  createUniqueUsername,
  DISABLED_ACCOUNT_MESSAGE,
  isActiveUser,
} from "@/lib/auth";
import {
  consumeOAuthStateCookie,
  getGoogleRedirectUri,
  getOAuthErrorRedirect,
  type GoogleTokenResponse,
  type GoogleUserInfo,
} from "@/lib/google-oauth";
import { prisma } from "@/lib/prisma";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

async function getGoogleTokens(request: Request, code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleRedirectUri(request),
    }),
  });

  return (await response.json()) as GoogleTokenResponse;
}

async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return (await response.json()) as GoogleUserInfo;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = await consumeOAuthStateCookie();

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      getOAuthErrorRedirect(request, "Google OAuth is not configured."),
    );
  }

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      getOAuthErrorRedirect(request, "Google sign in could not be verified."),
    );
  }

  const tokens = await getGoogleTokens(request, code);

  if (!tokens.access_token) {
    return NextResponse.redirect(
      getOAuthErrorRedirect(
        request,
        tokens.error_description ?? "Google sign in failed.",
      ),
    );
  }

  const googleUser = await getGoogleUserInfo(tokens.access_token);
  const email = googleUser.email?.trim().toLowerCase() ?? "";
  const providerAccountId = googleUser.sub;

  if (!email || !providerAccountId || !googleUser.email_verified) {
    return NextResponse.redirect(
      getOAuthErrorRedirect(request, "Google account email must be verified."),
    );
  }

  const oauthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId,
      },
    },
    include: {
      user: true,
    },
  });

  let user = oauthAccount?.user ?? null;

  if (!user) {
    user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  if (user && !isActiveUser(user)) {
    return NextResponse.redirect(
      getOAuthErrorRedirect(request, DISABLED_ACCOUNT_MESSAGE),
    );
  }

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;

  if (!user) {
    const name = googleUser.name?.trim() || email.split("@")[0] || "Bloom Barista";

    user = await prisma.user.create({
      data: {
        email,
        name,
        username: await createUniqueUsername(email),
        avatar: getInitials(name) || "BB",
        bio: "New to Bloom & Brew Social.",
        location: "Kuala Lumpur",
        oauthAccounts: {
          create: {
            provider: "google",
            providerAccountId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
          },
        },
      },
    });
  } else if (!oauthAccount) {
    await prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider: "google",
        providerAccountId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
    });
  } else {
    await prisma.oAuthAccount.update({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId,
        },
      },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? oauthAccount.refreshToken,
        expiresAt,
      },
    });
  }

  await createSession(user.id);

  return NextResponse.redirect(new URL("/", request.url));
}
