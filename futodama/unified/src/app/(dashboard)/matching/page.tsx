"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { tasks, getActiveTasks } from "@/lib/mock-data/tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ClipboardList, Users, TrendingUp, ArrowRight } from "lucide-react";

export default function MatchingPage() {
  const { t, locale } = useLanguage();
  const activeTasks = getActiveTasks();

  const labels = locale === "da" ? {
    title: "Matching",
    subtitle: "Find de bedste kandidater til dine opgaver",
    selectTask: "Vælg en opgave",
    selectTaskDesc: "Vælg en opgave for at se matchede kandidater",
    activeTasks: "Aktive opgaver",
    withOpenMatchings: "Med åbne matchinger",
    totalMatches: "Total matches",
    acrossAllTasks: "På tværs af alle opgaver",
    averageScore: "Gennemsnitlig score",
    topCandidates: "Top kandidater",
    findMatches: "Find matches",
    noActiveTasks: "Ingen aktive opgaver",
    createTask: "Opret opgave",
  } : {
    title: "Matching",
    subtitle: "Find the best candidates for your tasks",
    selectTask: "Select a task",
    selectTaskDesc: "Select a task to see matched candidates",
    activeTasks: "Active tasks",
    withOpenMatchings: "With open matchings",
    totalMatches: "Total matches",
    acrossAllTasks: "Across all tasks",
    averageScore: "Average score",
    topCandidates: "Top candidates",
    findMatches: "Find matches",
    noActiveTasks: "No active tasks",
    createTask: "Create task",
  };

  const totalMatches = activeTasks.reduce((acc, t) => acc + t.matchCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{labels.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{labels.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{labels.activeTasks}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{labels.withOpenMatchings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{labels.totalMatches}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">{labels.acrossAllTasks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{labels.averageScore}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">78%</div>
            <p className="text-xs text-muted-foreground mt-1">{labels.topCandidates}</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{labels.selectTask}</CardTitle>
          <CardDescription>{labels.selectTaskDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTasks.length > 0 ? (
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{task.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.client} • {task.matchCount} matches • {task.requirements.filter(r => r.priority === "required").length} required skills
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/matching/${task.id}`}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {labels.findMatches}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{labels.noActiveTasks}</p>
              <Button asChild>
                <Link href="/tasks/new">{labels.createTask}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
