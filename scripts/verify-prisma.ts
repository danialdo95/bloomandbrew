import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const post = await prisma.post.findFirst({
    include: {
      author: true,
      comments: true,
      likes: true,
      savedBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(
    `✅ Connected${post ? ` — latest post by ${post.author.username} with ${post.comments.length} comments, ${post.likes.length} likes, and ${post.savedBy.length} saves` : ""}`,
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
