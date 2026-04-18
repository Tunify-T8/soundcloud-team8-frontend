import { Genre } from "@/shared/types/Genre";

// Feed item action type
export interface FeedAction {
  username: string;
  displayName?: string;
  action: "post" | "repost";
  userAvatarUrl: string | null;
  date: string;
}

// Feed item type
export interface FeedItem {
  id: string;
  action: FeedAction;
  title: string;
  artist: string;
  genre?: Genre;
  durationInSeconds: number;
  coverUrl: string | null;
  waveformUrl: string | null;
  numberOfComments: number;
  numberOfLikes: number;
  numberOfListens: number;
  numberOfReposts: number;
  isLiked: boolean;
  isReposted: boolean;
}

// Feed response type
export interface FeedResponse {
  items: FeedItem[];
  page: number;
  limit: number;
  hasMore: boolean;
}
