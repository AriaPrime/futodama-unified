"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { TaskForm } from "@/components/tasks";
import { ArrowLeft } from "lucide-react";

export default function NewTaskPage() {
  const { locale } = useLanguage();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/tasks"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "da" ? "Tilbage til opgaver" : "Back to tasks"}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {locale === "da" ? "Opret ny opgave" : "Create new task"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {locale === "da" 
            ? "Definer krav og find de bedste konsulenter"
            : "Define requirements and find the best consultants"
          }
        </p>
      </div>

      <TaskForm />
    </div>
  );
}
