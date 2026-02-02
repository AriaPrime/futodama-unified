import type { Notification } from "@/types";

export const notifications: Notification[] = [
  {
    id: "1",
    type: "cv_reminder",
    title: "CV opdatering påkrævet",
    message: "Dit CV er ikke blevet opdateret i over 3 måneder.",
    read: false,
    createdAt: "2025-01-18T09:00:00Z",
    link: "/consultants/me/edit"
  },
  {
    id: "2",
    type: "new_match",
    title: "Ny match fundet",
    message: "Du matcher opgaven 'Senior Full-Stack Developer' hos Salling Group med 87% score.",
    read: false,
    createdAt: "2025-01-17T14:30:00Z",
    link: "/matching/1"
  },
  {
    id: "3",
    type: "deadline",
    title: "Deadline nærmer sig",
    message: "Opgaven 'Cloud Architect til Migration Projekt' har deadline om 5 dage.",
    read: true,
    createdAt: "2025-01-16T10:00:00Z",
    link: "/tasks/2"
  },
  {
    id: "4",
    type: "system",
    title: "Nye funktioner tilføjet",
    message: "Vi har tilføjet AI-baseret CV sundhedstjek.",
    read: true,
    createdAt: "2025-01-15T08:00:00Z"
  },
  {
    id: "5",
    type: "new_match",
    title: "Ny forespørgsel",
    message: "Sundhed.dk har oprettet en ny opgave der matcher dine kompetencer.",
    read: false,
    createdAt: "2025-01-14T16:45:00Z",
    link: "/tasks/3"
  }
];

export function getUnreadNotifications(): Notification[] {
  return notifications.filter(n => !n.read);
}

export function getNotificationsByType(type: Notification["type"]): Notification[] {
  return notifications.filter(n => n.type === type);
}
