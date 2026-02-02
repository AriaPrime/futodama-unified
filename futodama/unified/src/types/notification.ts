// Notification Types

export type NotificationType = "cv_reminder" | "new_match" | "deadline" | "system" | "match" | "reminder" | "alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  timestamp?: string; // Alias for createdAt
  link?: string;
}
