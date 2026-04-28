export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  country: string;
  city: string;
  socialAccounts: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  role: string;
  coverUrl: string;
  isCertified: boolean;
  followersCount: number | string;
  followingCount: number;
  tracksCount: number;
  isMe: boolean;
  // likesReceivedCount: number;
  // isFollowing: boolean;
  createdAt: string;
}

export interface FollowingUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl: string;
  isCertified: boolean;
  followersCount?: number | string;
}

// --- API Types ---

// User profile (GET /users/me, /users/{userIdOrUsername})

// Profile for /users/me (private, full info)
export interface MeUserProfile {
  id: string;
  username: string;
  displayName?: string | null;
  email: string;
  role: "ARTIST" | "LISTENER";
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  isCertified: boolean;
  isActive: boolean;
  visibility: "PUBLIC" | "PRIVATE";
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

// Profile for /users/{userIdOrUsername} (public info)
export interface PublicUserProfile {
  id: string;
  username: string;
  displayName?: string | null;
  role: "ARTIST" | "LISTENER";
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  followersCount: number;
  followingCount: number;
  tracksUploadedCount: number;
}

// Update profile (PATCH /users/me/profile)
export interface UpdateUserProfileRequest {
  displayName?: string;
  username?: string;
  email?: string;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  visibility?: "PUBLIC" | "PRIVATE";
  role?: "ARTIST" | "LISTENER";
  currentPassword?: string;
}

// Social links (GET/PATCH /users/me/social-links)
export type SocialPlatform =
  | "INSTAGRAM"
  | "YOUTUBE"
  | "SPOTIFY"
  | "TIKTOK"
  | "SOUNDCLOUD"
  | "TWITTER";

export interface UserSocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface UserSocialLinks {
  links: UserSocialLink[];
}

// Genres (GET/PATCH /users/me/genres)
export interface UserGenres {
  genres: string[];
}

// Track summary (GET /users/me/tracks)
export interface UserTrack {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  audioUrl?: string | null;
  genre?: string | null;
  createdAt: string;
  artist?: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    isVerified?: boolean;
  };
  engagement?: {
    likeCount: number;
    repostCount: number;
    commentCount: number;
    playCount: number;
  };
  interaction?: {
    isLiked: boolean;
    isReposted: boolean;
  };
}

export interface UserTracksResponse {
  page: number;
  limit: number;
  total: number;
  tracks: UserTrack[];
}

// Followers (GET /users/{userId}/followers)
export interface UserFollower {
  id: string;
  username: string;
  avatarUrl?: string | null;
  isFollowing?: boolean | null;
}

export interface UserFollowersResponse {
  followers: UserFollower[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Following (GET /users/{userId}/following)
export interface UserFollowing {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  isCertified?: boolean;
  followersCount?: number;
  isNotificationEnabled?: boolean;
}

export interface UserFollowingResponse {
  page: number;
  limit: number;
  hasMore: boolean;
  following: UserFollowing[];
}

// Mutual friends (GET /users/{userId}/mutual-friends)
export interface MutualFriend {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string | null;
}

export interface MutualFriendsResponse {
  page: number;
  limit: number;
  total: number;
  mutualFriends: MutualFriend[];
}

// Follow status (GET /users/{userId}/follow-status)
export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutual: boolean;
}

// Blocked users (GET /users/me/blocked-users)
export interface BlockedUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
  blockedAt: string;
}

export interface BlockedUsersResponse {
  page: number;
  limit: number;
  total: number;
  blockedUsers: BlockedUser[];
}

// Suggested users (GET /users/me/suggested)
export interface SuggestedUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  role: "ARTIST" | "LISTENER";
  mutualFollowersCount: number;
  tracksUploadedCount: number;
  followersCount: number;
  followingCount: number;
}

export interface SuggestedUsersResponse {
  page: number;
  limit: number;
  total: number;
  users: SuggestedUser[];
}

// --- End of API Types ---
