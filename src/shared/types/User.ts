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
    followersCount: number;
    followingCount: number;
    tracksCount: number;
    // likesReceivedCount: number;
    // isFollowing: boolean;
    createdAt: string;
}