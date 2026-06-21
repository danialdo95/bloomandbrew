import "dotenv/config";

import { prisma } from "../src/lib/prisma";

const POST_COUNT = 35;
const POST_ID_PREFIX = "seed-feed-post-";

const authors = [
  {
    email: "feed.florist@bloomandbrew.local",
    name: "Nora Petals",
    username: "norapetals",
    avatar: "NP",
    bio: "Seasonal stems, wrapping notes, and cafe-table flowers.",
    location: "Kuala Lumpur",
  },
  {
    email: "feed.barista@bloomandbrew.local",
    name: "Ari Brews",
    username: "aribrews",
    avatar: "AB",
    bio: "Espresso experiments and quiet cafe corners.",
    location: "Petaling Jaya",
  },
  {
    email: "feed.stylist@bloomandbrew.local",
    name: "Mei Tables",
    username: "meitables",
    avatar: "MT",
    bio: "Cafe-floral styling ideas for slow weekends.",
    location: "Subang Jaya",
  },
] as const;

const postIdeas = [
  "Testing a blush rose palette beside today’s flat white.",
  "A quiet window seat, an oat latte, and a tiny jar of chamomile.",
  "Today’s bouquet recipe: garden roses, waxflower, and soft eucalyptus.",
  "Dialing in a citrus espresso tonic for the afternoon menu.",
  "Trying kraft-paper wrapping with a narrow velvet ribbon.",
  "A small cafe-table arrangement can completely change the room.",
  "Milk texture practice: glossy, elastic, and ready for a tulip pour.",
  "Weekend flower-market colors: coral, cream, and a little green.",
  "Pairing a honey latte with warm yellow ranunculus.",
  "Behind the counter before opening—the calmest ten minutes of the day.",
] as const;

const imageUrls = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
] as const;

const filters = ["Natural", "Blush", "Cream", "Vintage"] as const;
const locations = ["Kuala Lumpur", "Petaling Jaya", "Subang Jaya"] as const;

function postId(index: number) {
  return `${POST_ID_PREFIX}${String(index + 1).padStart(2, "0")}`;
}

async function main() {
  const seededAuthors = await Promise.all(
    authors.map((author) =>
      prisma.user.upsert({
        where: { email: author.email },
        update: author,
        create: author,
      }),
    ),
  );

  const now = Date.now();
  const posts = Array.from({ length: POST_COUNT }, (_, index) => ({
    id: postId(index),
    authorId: seededAuthors[index % seededAuthors.length].id,
    community: "Bloom & Brew",
    content: `${postIdeas[index % postIdeas.length]} Test post ${index + 1} of ${POST_COUNT}.`,
    imageUrl: index % 4 === 0 ? imageUrls[index % imageUrls.length] : null,
    filter: filters[index % filters.length],
    location: locations[index % locations.length],
    status: "VISIBLE",
    createdAt: new Date(now - index * 30 * 60 * 1000),
  }));

  const comments = posts.flatMap((post, postIndex) =>
    Array.from({ length: postIndex % 6 }, (_, commentIndex) => ({
      id: `seed-feed-comment-${postIndex + 1}-${commentIndex + 1}`,
      postId: post.id,
      authorName: authors[commentIndex % authors.length].name,
      authorUsername: authors[commentIndex % authors.length].username,
      authorAvatar: authors[commentIndex % authors.length].avatar,
      text: `Seeded comment ${commentIndex + 1} on test post ${postIndex + 1}.`,
      createdAt: new Date(post.createdAt.getTime() + (commentIndex + 1) * 60_000),
    })),
  );

  const likes = posts.flatMap((post, postIndex) =>
    Array.from({ length: postIndex % 5 }, (_, likeIndex) => ({
      postId: post.id,
      userIdentifier: `seed-feed-liker-${likeIndex + 1}`,
    })),
  );

  const shares = posts.flatMap((post, postIndex) =>
    Array.from({ length: postIndex % 3 }, (_, shareIndex) => ({
      postId: post.id,
      userIdentifier: `seed-feed-sharer-${shareIndex + 1}`,
    })),
  );

  const savedPosts = posts
    .filter((_, index) => index % 4 === 0)
    .map((post) => ({
      postId: post.id,
      userIdentifier: "seed-feed-bookmarker",
    }));

  await prisma.$transaction([
    prisma.post.deleteMany({
      where: { id: { startsWith: POST_ID_PREFIX } },
    }),
    prisma.post.createMany({ data: posts }),
    prisma.comment.createMany({ data: comments }),
    prisma.like.createMany({ data: likes }),
    prisma.postShare.createMany({ data: shares }),
    prisma.savedPost.createMany({ data: savedPosts }),
  ]);

  console.log(
    `Seeded ${posts.length} Bloom posts, ${comments.length} comments, ${likes.length} likes, and ${shares.length} shares.`,
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
