import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
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
