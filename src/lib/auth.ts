import { scryptSync, timingSafeEqual, randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import type { SocialProfile } from "@/types/social";

const SESSION_COOKIE = "bloom_brew_session";
const SESSION_DAYS = 30;

function normalizeUsername(value: string) {
  return value.replace(/[^a-z0-9_]/gi, "").toLowerCase() || "bloombarista";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const actual = Buffer.from(hash, "hex");
  const expected = scryptSync(password, salt, 64);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function createUniqueUsername(email: string) {
  const base = normalizeUsername(email.split("@")[0] ?? "bloombarista");
  let username = base;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}${suffix}`;
    suffix += 1;
  }

  return username;
}

export function toAuthUser(user: {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  bio: string | null;
  location: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    profile: {
      name: user.name,
      username: user.username,
      avatar: user.avatar || getInitials(user.name) || "BB",
      bio: user.bio ?? "New to Bloom & Brew Social.",
      location: user.location ?? "Kuala Lumpur",
    } satisfies SocialProfile,
  };
}

export function isAdminUser(user: { email: string } | null | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });
    }

    return null;
  }

  return session.user;
}
