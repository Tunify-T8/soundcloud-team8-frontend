export interface User {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    tracksCount: number;
    likesReceivedCount: number;
    isFollowing: boolean;
    createdAt: string;
}