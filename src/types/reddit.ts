export type RedditPost = {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  comments: number;
  url: string;
  permalink: string;
  imageUrl: string | null;
  createdAt: string;
};

export type RedditFeedResponse = {
  posts: RedditPost[];
  source: "reddit" | "fallback";
  fetchedAt: string;
};
