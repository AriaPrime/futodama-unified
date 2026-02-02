"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { tasks } from "@/lib/mock-data/tasks";
import { TaskCard } from "@/components/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import type { TaskStatus } from "@/types";

export default function TasksPage() {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (search) {
        const lowerSearch = search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(lowerSearch) ||
          task.client.toLowerCase().includes(lowerSearch) ||
          task.description.toLowerCase().includes(lowerSearch);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [search, statusFilter]);

  const statusOptions: { value: TaskStatus | "all"; label: string }[] = [
    { value: "all", label: t.tasks.allStatuses },
    { value: "active", label: t.tasks.active },
    { value: "draft", label: t.tasks.draft },
    { value: "in_progress", label: t.tasks.inProgress },
    { value: "completed", label: t.tasks.completed },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.tasks.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredTasks.length} {t.tasks.found}
          </p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            {t.tasks.createTask}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.tasks.searchPlaceholder}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.tasks.noTasksMatch}</p>
          <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            {t.tasks.resetFilters}
          </Button>
        </div>
      )}
    </div>
  );
}
