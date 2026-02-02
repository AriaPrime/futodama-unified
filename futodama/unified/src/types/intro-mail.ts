// Intro Mail Types

export type IntroMailStatus = "draft" | "sent";

export interface IntroMail {
  id: string;
  taskId: string;
  consultantIds: string[];
  template: string;
  subject: string;
  body: string;
  status: IntroMailStatus;
  createdAt: string;
  sentAt?: string;
}
