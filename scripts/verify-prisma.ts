import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const post = await prisma.post.findFirst({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(
    `✅ Connected${post ? ` — latest post by ${post.author.username}` : ""}`,
  );
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
