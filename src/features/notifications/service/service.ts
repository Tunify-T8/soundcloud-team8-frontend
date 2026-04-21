import { api } from "@/features/auth/services/api"; 
import type { NotificationsResponse  , NotificationPreferences ,GetNotificationsParams , PreferenceChannel } from "../types";

// GET /notifications
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>("/notifications", {
    params,
  });
  return data;
}

// GET /notifications/unread-count
export async function getUnreadCount(): Promise<{ unreadCount: number }> {
  const { data } = await api.get<{ unreadCount: number }>(
    "/notifications/unread-count"
  );
  return data;
}

// PATCH /notifications/read-all
export async function markAllAsRead(): Promise<{
  message: string;
  updatedCount: number;
}> {
  const { data } = await api.patch<{ message: string; updatedCount: number }>(
    "/notifications/read-all"
  );
  return data;
}

// PATCH /notifications/:notificationId
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>(
    `/notifications/${notificationId}`
  );
  return data;
}

// GET /notifications/preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await api.get<NotificationPreferences>(
    "/notifications/preferences"
  );
  return data;
}

// PATCH /notifications/preferences
export async function updateNotificationPreferences(
  updates: Partial<{
    push: Partial<PreferenceChannel>;
    email: Partial<PreferenceChannel>;
  }>
): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>(
    "/notifications/preferences",
    updates
  );
  return data;
}

// POST /users/:userId/follow  (used for "Follow back" action)
export async function followUser(userId: string): Promise<void> {
  await api.post(`/users/${userId}/follow`);
}

// POST /users/:userId/unfollow
export async function unfollowUser(userId: string): Promise<void> {
  await api.post(`/users/${userId}/unfollow`);
}