// Task/Opgave Types

export type TaskStatus = "draft" | "active" | "in_progress" | "completed" | "cancelled";
export type RequirementType = "skill" | "experience" | "location" | "availability";
export type RequirementPriority = "required" | "preferred" | "nice_to_have";

export interface Task {
  id: string;
  title: string;
  client: string;
  description: string;
  requirements: TaskRequirement[];
  deadline: string;
  budget?: {
    min: number;
    max: number;
  };
  status: TaskStatus;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequirement {
  id: string;
  type: RequirementType;
  value: string;
  priority: RequirementPriority;
}
