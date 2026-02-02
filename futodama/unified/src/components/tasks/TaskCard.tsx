"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Task, TaskStatus } from "@/types";
import { Calendar, Users, Building2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: Task;
}

const statusColors: Record<TaskStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<TaskStatus, { en: string; da: string }> = {
  draft: { en: "Draft", da: "Kladde" },
  active: { en: "Active", da: "Aktiv" },
  in_progress: { en: "In Progress", da: "I gang" },
  completed: { en: "Completed", da: "Afsluttet" },
  cancelled: { en: "Cancelled", da: "Annulleret" },
};

export function TaskCard({ task }: TaskCardProps) {
  const { locale } = useLanguage();
  
  const deadline = new Date(task.deadline);
  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntil <= 7 && daysUntil > 0;
  const isOverdue = daysUntil <= 0;

  const requiredSkills = task.requirements
    .filter(r => r.type === "skill" && r.priority === "required")
    .slice(0, 3);

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Building2 className="h-4 w-4" />
              <span>{task.client}</span>
            </div>
          </div>
          <Badge className={statusColors[task.status]}>
            {statusLabels[task.status][locale]}
          </Badge>
        </div>

        {/* Requirements */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {requiredSkills.map((req) => (
            <span
              key={req.id}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {req.value}
            </span>
          ))}
          {task.requirements.filter(r => r.type === "skill").length > 3 && (
            <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
              +{task.requirements.filter(r => r.type === "skill").length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{task.matchCount} matches</span>
            </div>
            {task.budget && (
              <span className="text-gray-500 dark:text-gray-400">
                {task.budget.min}-{task.budget.max} DKK/t
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1.5 text-sm ${
            isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-500 dark:text-gray-400"
          }`}>
            <Clock className="h-4 w-4" />
            <span>
              {isOverdue
                ? locale === "da" ? "Overskredet" : "Overdue"
                : `${daysUntil}d`
              }
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
