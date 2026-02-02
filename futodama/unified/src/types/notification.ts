// Notification Types

export type NotificationType = "cv_reminder" | "new_match" | "deadline" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
