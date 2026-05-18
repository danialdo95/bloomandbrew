export type SocialProfile = {
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
};

export type SocialComment = {
  id: string;
  author: string;
  text: string;
  system?: boolean;
};

export type SocialPost = {
  id: string;
  source?: "bloom" | "reddit" | "youtube";
  author: string;
  username: string;
  avatar: string;
  community: string;
  content: string;
  imageUrl: string | null;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubeChannel?: string;
  externalUrl?: string;
  filter: string;
  location: string;
  createdAt: string;
  likes: number;
  shares: number;
  externalCommentCount?: number;
  comments: SocialComment[];
  liked: boolean;
  bookmarked: boolean;
};

export type NotificationItem = {
  id: string;
  text: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
};

export type DemoUser = {
  id: string;
  email: string;
  profile: SocialProfile;
};

export type SuggestedPerson = {
  id?: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  isFollowing?: boolean;
};
