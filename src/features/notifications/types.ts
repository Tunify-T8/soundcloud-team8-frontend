
export type NotificationType =
  | "user_followed"
  | "track_liked"
  | "track_commented"
  | "track_reposted"
  | "new_release"
  | "new_message"
  | "system"
  | "subscription";
 
export interface NotificationActor {
  id: string;
  username: string;
  avatarUrl?: string | null;
}
 
export interface NotificationObject {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  referenceId?: string | null;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  isFollowed?: boolean;
}
 
export interface NotificationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}
 
export interface NotificationsResponse {
  data: NotificationObject[];
  meta: NotificationsMeta;
}
 
export interface NotificationPreferences {
  push: PreferenceChannel;
  email: PreferenceChannel;
}
 
export interface PreferenceChannel {
  enableAll: boolean;
  newFollower: boolean;
  repost: boolean;
  newPostFromFollowing: boolean;
  likesAndPlays: boolean;
  comment: boolean;
  featureUpdates: boolean;
  surveys: boolean;
  promotions: boolean;
  recommended: boolean;
  newMessage: boolean;
}
 
export type NotificationFilterType =
  | "all"
  | "track_liked"
  | "track_commented"
  | "user_followed"
  | "track_reposted"
  | "new_release"
  | "new_message"
  | "system"
  | "subscription";
 
export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: string; // comma-separated e.g. "like,comment"
  unread?: boolean;
}
 