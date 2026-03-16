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
  isVerified: boolean;
  followersCount: number | string;
  followingCount: number;
  tracksCount: number;
  isEditable: boolean;
  // likesReceivedCount: number;
  // isFollowing: boolean;
  createdAt: string;
}

export interface FollowingUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl: string;
  isVerified: boolean;
  followersCount?: number | string;
}
