export interface Like {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export interface Repost {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export interface EngagementCounts {
  likes: number;
  reposts: number;
  plays: number;
  comments: number;
}

export interface EngagementState {
  counts: EngagementCounts;
  isLiked: boolean;
  isReposted: boolean;
}