export type NotificationType =
  | "CONNECTION_REQUEST"
  | "CONNECTION_ACCEPTED"
  | "VERIFICATION_REQUEST"
  | "VERIFICATION_APPROVED"
  | "MESSAGE_RECEIVED"
  | "POST_LIKED"
  | "POST_COMMENTED"
  | "JOB_APPLIED"
  | "APPLICATION_STATUS_UPDATED";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}
