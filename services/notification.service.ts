import { api, unwrapData } from "@/services/api";
import type { NotificationItem } from "@/types/notification";

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await api.get<unknown>("/notifications");
    return unwrapData<NotificationItem[]>(response);
  },

  markAsRead: async (notificationId: string): Promise<NotificationItem> => {
    const response = await api.patch<unknown>(
      `/notifications/${notificationId}/read`,
    );

    return unwrapData<NotificationItem>(response);
  },
};
