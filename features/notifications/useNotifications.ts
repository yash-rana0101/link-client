"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationService.getNotifications,
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: 2,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  const unreadCount =
    notificationsQuery.data?.filter((notification) => !notification.isRead).length ??
    0;

  return {
    notificationsQuery,
    markReadMutation,
    unreadCount,
  };
};
