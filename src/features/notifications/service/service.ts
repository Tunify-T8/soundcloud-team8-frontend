import { api } from "@/features/auth/services/api"; // adjust path to your axios instance
import type { GetNotificationsParams } from "../types";
import type { NotificationsResponse } from "../types";

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


