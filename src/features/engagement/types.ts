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

export interface GetEngagementResponse {
  trackId: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
}

export interface UserPreview {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isCertified: boolean;
}

export interface PaginatedLikes {
  likes: UserPreview[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RepostEntry {
  repostId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isCertified: boolean;
  repostedAt: string;
}

export interface PaginatedReposts {
  reposts: RepostEntry[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiComment {
  commentId: string;
  trackId: string;
  user: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  };
  text: string;
  timestamp: number;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface PaginatedComments {
  comments: ApiComment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiReply {
  replyId: string;
  parentId: string;
  parentUsername: string;
  user: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  };
  text: string;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface PaginatedReplies {
  replies: ApiReply[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
