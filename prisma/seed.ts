import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
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

  await prisma.post.upsert({
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

  await prisma.post.upsert({
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
