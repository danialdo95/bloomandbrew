import "dotenv/config";
import { randomBytes, scryptSync } from "crypto";
import { prisma } from "../src/lib/prisma";

function hashSeedPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const adminPasswordHash = hashSeedPassword("password");
  const now = new Date();

  const admin = await prisma.user.upsert({
    where: { email: "admin@bloombrew.com" },
    update: {
      passwordHash: adminPasswordHash,
      name: "Bloom & Brew Admin",
      username: "bloombrewadmin",
      avatar: "BA",
      bio: "Admin account for managing Bloom & Brew Social.",
      location: "Kuala Lumpur",
    },
    create: {
      email: "admin@bloombrew.com",
      name: "Bloom & Brew Admin",
      username: "bloombrewadmin",
      passwordHash: adminPasswordHash,
      avatar: "BA",
      bio: "Admin account for managing Bloom & Brew Social.",
      location: "Kuala Lumpur",
    },
  });

  const petalNotes = await prisma.user.upsert({
    where: { email: "petalnotes@bloomandbrew.local" },
    update: {},
    create: {
      email: "petalnotes@bloomandbrew.local",
      name: "Petal Notes",
      username: "petalnotes",
      avatar: "PN",
      bio: "Bouquet styling and seasonal color palettes.",
      location: "Kuala Lumpur",
    },
  });

  const slowBar = await prisma.user.upsert({
    where: { email: "slowbar@bloomandbrew.local" },
    update: {},
    create: {
      email: "slowbar@bloomandbrew.local",
      name: "Slow Bar Daily",
      username: "slowbar",
      avatar: "SB",
      bio: "Cafe interiors, espresso bars, and quiet corners.",
      location: "Petaling Jaya",
    },
  });

  const latteStory = await prisma.user.upsert({
    where: { email: "lattestory@bloomandbrew.local" },
    update: {},
    create: {
      email: "lattestory@bloomandbrew.local",
      name: "Latte Story",
      username: "lattestory",
      avatar: "LS",
      bio: "Daily latte art practice and milk texture experiments.",
      location: "Subang Jaya",
    },
  });

  const maya = await prisma.user.upsert({
    where: { email: "maya@bloomandbrew.local" },
    update: {},
    create: {
      email: "maya@bloomandbrew.local",
      name: "Maya Tan",
      username: "mayablooms",
      bio: "Florist sharing daily bouquet experiments.",
    },
  });

  const leo = await prisma.user.upsert({
    where: { email: "leo@bloomandbrew.local" },
    update: {},
    create: {
      email: "leo@bloomandbrew.local",
      name: "Leo Amir",
      username: "leobrews",
      bio: "Cafe owner testing seasonal drinks.",
    },
  });

  const mayaPost = await prisma.post.upsert({
    where: { id: "seed-post-maya" },
    update: {},
    create: {
      id: "seed-post-maya",
      authorId: maya.id,
      content: "Testing a soft pink hand-tied bouquet for the weekend drop.",
      imageUrl:
        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
      location: "Kuala Lumpur",
    },
  });

  const leoPost = await prisma.post.upsert({
    where: { id: "seed-post-leo" },
    update: {},
    create: {
      id: "seed-post-leo",
      authorId: leo.id,
      content: "Dialing in a honey oat latte pairing for fresh tulip bundles.",
      imageUrl:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
      location: "Petaling Jaya",
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-maya" },
    update: {},
    create: {
      id: "seed-comment-maya",
      postId: mayaPost.id,
      authorName: "Bloom & Brew",
      authorUsername: "bloomandbrew",
      authorAvatar: "BB",
      text: "This is the first database-backed comment on a Bloom & Brew post.",
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-leo" },
    update: {},
    create: {
      id: "seed-comment-leo",
      postId: leoPost.id,
      authorName: "Petal Notes",
      authorUsername: "petalnotes",
      authorAvatar: "PN",
      text: "Honey oat latte with tulips sounds like a soft launch winner.",
    },
  });

  await prisma.like.upsert({
    where: {
      postId_userIdentifier: {
        postId: mayaPost.id,
        userIdentifier: "leobrews",
      },
    },
    update: {},
    create: {
      postId: mayaPost.id,
      userIdentifier: "leobrews",
    },
  });

  await prisma.like.upsert({
    where: {
      postId_userIdentifier: {
        postId: leoPost.id,
        userIdentifier: "mayablooms",
      },
    },
    update: {},
    create: {
      postId: leoPost.id,
      userIdentifier: "mayablooms",
    },
  });

  await prisma.savedPost.upsert({
    where: {
      postId_userIdentifier: {
        postId: mayaPost.id,
        userIdentifier: "mayablooms",
      },
    },
    update: {},
    create: {
      postId: mayaPost.id,
      userIdentifier: "mayablooms",
    },
  });

  await prisma.savedPost.upsert({
    where: {
      postId_userIdentifier: {
        postId: leoPost.id,
        userIdentifier: "leobrews",
      },
    },
    update: {},
    create: {
      postId: leoPost.id,
      userIdentifier: "leobrews",
    },
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: maya.id,
        followingId: petalNotes.id,
      },
    },
    update: {},
    create: {
      followerId: maya.id,
      followingId: petalNotes.id,
    },
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: leo.id,
        followingId: slowBar.id,
      },
    },
    update: {},
    create: {
      followerId: leo.id,
      followingId: slowBar.id,
    },
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: leo.id,
        followingId: latteStory.id,
      },
    },
    update: {},
    create: {
      followerId: leo.id,
      followingId: latteStory.id,
    },
  });

  const calendarStarts = [2, 4, 6].map((dayOffset) => {
    const date = new Date(now);
    date.setDate(now.getDate() + dayOffset);
    date.setHours(dayOffset === 4 ? 14 : 10, dayOffset === 4 ? 30 : 0, 0, 0);
    return date;
  });

  await prisma.calendarEvent.upsert({
    where: { id: "seed-calendar-latte-art" },
    update: {
      description: "A public post idea for cafe creators to share a pour, cafe corner, or flower pairing.",
      prompt: "Share a latte art pour with a floral pairing idea for the Bloom & Brew feed.",
      eventType: "CAFE",
      status: "SCHEDULED",
      visibility: "PUBLIC",
      startsAt: calendarStarts[0],
      createdById: admin.id,
    },
    create: {
      id: "seed-calendar-latte-art",
      title: "Latte art class",
      description: "A public post idea for cafe creators to share a pour, cafe corner, or flower pairing.",
      prompt: "Share a latte art pour with a floral pairing idea for the Bloom & Brew feed.",
      eventType: "CAFE",
      status: "SCHEDULED",
      visibility: "PUBLIC",
      startsAt: calendarStarts[0],
      createdById: admin.id,
    },
  });

  await prisma.calendarEvent.upsert({
    where: { id: "seed-calendar-bouquet-drop" },
    update: {
      description: "Seasonal arrangement post idea for florist and cafe display posts.",
      prompt: "Post a seasonal bouquet color palette and explain which drink you would pair with it.",
      eventType: "FLORAL",
      status: "SCHEDULED",
      visibility: "PUBLIC",
      startsAt: calendarStarts[1],
      createdById: admin.id,
    },
    create: {
      id: "seed-calendar-bouquet-drop",
      title: "Bouquet drop",
      description: "Seasonal arrangement post idea for florist and cafe display posts.",
      prompt: "Post a seasonal bouquet color palette and explain which drink you would pair with it.",
      eventType: "FLORAL",
      status: "SCHEDULED",
      visibility: "PUBLIC",
      startsAt: calendarStarts[1],
      createdById: admin.id,
    },
  });

  await prisma.calendarEvent.upsert({
    where: { id: "seed-calendar-weekend-crawl" },
    update: {
      description: "Community post idea for saving cafe and bouquet inspiration from the weekend.",
      prompt: "Share one cafe stop and one floral detail you would recommend for a weekend visit.",
      eventType: "SOCIAL",
      status: "SCHEDULED",
      visibility: "PUBLIC",
      startsAt: calendarStarts[2],
      createdById: admin.id,
    },
    create: {
      id: "seed-calendar-weekend-crawl",
      title: "Weekend cafe crawl",
      description: "Community post idea for saving cafe and bouquet inspiration from the weekend.",
      prompt: "Share one cafe stop and one floral detail you would recommend for a weekend visit.",
      eventType: "SOCIAL",
      status: "SCHEDULED",
      visibility: "PUBLIC",
      startsAt: calendarStarts[2],
      createdById: admin.id,
    },
  });

  console.log("Seeded Bloom & Brew starter data.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
