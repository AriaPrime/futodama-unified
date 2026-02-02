import type { Task } from "@/types";

export const tasks: Task[] = [
  {
    id: "1",
    title: "Senior Full-Stack Developer til E-commerce Platform",
    client: "Salling Group",
    description: "Vi søger en erfaren full-stack developer til at hjælpe med udviklingen af vores nye e-commerce platform.",
    requirements: [
      { id: "r1", type: "skill", value: "React", priority: "required" },
      { id: "r2", type: "skill", value: "Node.js", priority: "required" },
      { id: "r3", type: "skill", value: "TypeScript", priority: "required" },
      { id: "r4", type: "experience", value: "5+ års erfaring", priority: "required" },
      { id: "r5", type: "skill", value: "E-commerce erfaring", priority: "preferred" },
      { id: "r6", type: "location", value: "København/Hybrid", priority: "required" }
    ],
    deadline: "2025-02-15",
    budget: { min: 1000, max: 1300 },
    status: "active",
    matchCount: 4,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-15"
  },
  {
    id: "2",
    title: "Cloud Architect til Migration Projekt",
    client: "Coloplast",
    description: "Coloplast søger en erfaren cloud architect til at lede vores cloud migration program.",
    requirements: [
      { id: "r1", type: "skill", value: "Azure", priority: "required" },
      { id: "r2", type: "skill", value: "Cloud Architecture", priority: "required" },
      { id: "r3", type: "skill", value: "Terraform/IaC", priority: "required" },
      { id: "r4", type: "experience", value: "10+ års IT erfaring", priority: "required" },
      { id: "r5", type: "skill", value: "Kubernetes", priority: "preferred" }
    ],
    deadline: "2025-01-31",
    budget: { min: 1300, max: 1500 },
    status: "active",
    matchCount: 2,
    createdAt: "2025-01-08",
    updatedAt: "2025-01-12"
  },
  {
    id: "3",
    title: "UX Designer til Sundhedsapp",
    client: "Sundhed.dk",
    description: "Sundhed.dk søger en UX designer til at redesigne vores borgervendte sundhedsportal.",
    requirements: [
      { id: "r1", type: "skill", value: "UX Design", priority: "required" },
      { id: "r2", type: "skill", value: "Figma", priority: "required" },
      { id: "r3", type: "skill", value: "User Research", priority: "required" },
      { id: "r4", type: "skill", value: "Accessibility", priority: "required" }
    ],
    deadline: "2025-02-28",
    budget: { min: 950, max: 1150 },
    status: "active",
    matchCount: 3,
    createdAt: "2025-01-12",
    updatedAt: "2025-01-14"
  },
  {
    id: "4",
    title: "Data Scientist til Predictive Maintenance",
    client: "Vestas Wind Systems",
    description: "Vestas søger en data scientist til at arbejde med predictive maintenance på vores globale vindmølleflåde.",
    requirements: [
      { id: "r1", type: "skill", value: "Python", priority: "required" },
      { id: "r2", type: "skill", value: "Machine Learning", priority: "required" },
      { id: "r3", type: "skill", value: "TensorFlow/PyTorch", priority: "required" }
    ],
    deadline: "2025-03-15",
    budget: { min: 1200, max: 1400 },
    status: "draft",
    matchCount: 1,
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15"
  },
  {
    id: "5",
    title: "Security Consultant til Penetration Test",
    client: "Jyske Bank",
    description: "Jyske Bank søger en security consultant til at udføre omfattende penetration test.",
    requirements: [
      { id: "r1", type: "skill", value: "Penetration Testing", priority: "required" },
      { id: "r2", type: "skill", value: "OSCP/OSCE", priority: "preferred" },
      { id: "r3", type: "skill", value: "Web Security", priority: "required" },
      { id: "r4", type: "experience", value: "Finanssektorerfaring", priority: "required" }
    ],
    deadline: "2025-02-10",
    budget: { min: 1300, max: 1500 },
    status: "active",
    matchCount: 1,
    createdAt: "2025-01-05",
    updatedAt: "2025-01-10"
  }
];

export function getTaskById(id: string): Task | undefined {
  return tasks.find(t => t.id === id);
}

export function getTasksByStatus(status: Task["status"]): Task[] {
  return tasks.filter(t => t.status === status);
}

export function getActiveTasks(): Task[] {
  return tasks.filter(t => t.status === "active" || t.status === "in_progress");
}

export function searchTasks(query: string): Task[] {
  const lowerQuery = query.toLowerCase();
  return tasks.filter(t =>
    t.title.toLowerCase().includes(lowerQuery) ||
    t.client.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery)
  );
}
