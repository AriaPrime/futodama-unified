"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTaskById } from "@/lib/mock-data/tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Calendar, Clock, Users, Sparkles, Edit, DollarSign } from "lucide-react";
import type { TaskStatus, RequirementPriority } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<TaskStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const priorityColors: Record<RequirementPriority, string> = {
  required: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  preferred: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  nice_to_have: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
};

export default function TaskDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { locale } = useLanguage();
  const task = getTaskById(id);

  if (!task) {
    notFound();
  }

  const deadline = new Date(task.deadline);
  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const labels = locale === "da" ? {
    back: "Tilbage til opgaver",
    edit: "Rediger",
    findMatches: "Find matches",
    description: "Beskrivelse",
    requirements: "Krav",
    required: "Påkrævet",
    preferred: "Foretrukket",
    niceToHave: "Nice to have",
    details: "Detaljer",
    client: "Kunde",
    deadline: "Deadline",
    budget: "Budget",
    status: "Status",
    matches: "Matches",
    daysLeft: "dage tilbage",
    overdue: "Overskredet",
  } : {
    back: "Back to tasks",
    edit: "Edit",
    findMatches: "Find matches",
    description: "Description",
    requirements: "Requirements",
    required: "Required",
    preferred: "Preferred",
    niceToHave: "Nice to have",
    details: "Details",
    client: "Client",
    deadline: "Deadline",
    budget: "Budget",
    status: "Status",
    matches: "Matches",
    daysLeft: "days left",
    overdue: "Overdue",
  };

  const statusLabels: Record<TaskStatus, string> = {
    draft: locale === "da" ? "Kladde" : "Draft",
    active: locale === "da" ? "Aktiv" : "Active",
    in_progress: locale === "da" ? "I gang" : "In Progress",
    completed: locale === "da" ? "Afsluttet" : "Completed",
    cancelled: locale === "da" ? "Annulleret" : "Cancelled",
  };

  // Group requirements by priority
  const reqByPriority = task.requirements.reduce((acc, req) => {
    if (!acc[req.priority]) acc[req.priority] = [];
    acc[req.priority].push(req);
    return acc;
  }, {} as Record<RequirementPriority, typeof task.requirements>);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/tasks"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {labels.back}
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {labels.edit}
          </Button>
          <Button asChild>
            <Link href={`/matching/${task.id}`}>
              <Sparkles className="mr-2 h-4 w-4" />
              {labels.findMatches}
            </Link>
          </Button>
        </div>
      </div>

      {/* Title Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Building2 className="h-4 w-4" />
                {task.client}
              </CardDescription>
            </div>
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>{labels.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{task.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>{labels.requirements}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["required", "preferred", "nice_to_have"] as RequirementPriority[]).map((priority) => (
                reqByPriority[priority]?.length > 0 && (
                  <div key={priority}>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {priority === "required" ? labels.required : priority === "preferred" ? labels.preferred : labels.niceToHave}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {reqByPriority[priority].map((req) => (
                        <span
                          key={req.id}
                          className={`px-3 py-1.5 rounded-lg text-sm border ${priorityColors[priority]}`}
                        >
                          {req.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>{labels.details}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {labels.client}
                </span>
                <span className="font-medium">{task.client}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {labels.deadline}
                </span>
                <span className="font-medium">
                  {deadline.toLocaleDateString(locale === "da" ? "da-DK" : "en-GB")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {labels.status}
                </span>
                <span className={`font-medium ${daysUntil <= 0 ? "text-red-600" : daysUntil <= 7 ? "text-amber-600" : ""}`}>
                  {daysUntil <= 0 ? labels.overdue : `${daysUntil} ${labels.daysLeft}`}
                </span>
              </div>
              {task.budget && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {labels.budget}
                  </span>
                  <span className="font-medium">{task.budget.min}-{task.budget.max} DKK/t</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {labels.matches}
                </span>
                <span className="font-medium">{task.matchCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Button className="w-full" size="lg" asChild>
            <Link href={`/matching/${task.id}`}>
              <Sparkles className="mr-2 h-5 w-5" />
              {labels.findMatches}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
