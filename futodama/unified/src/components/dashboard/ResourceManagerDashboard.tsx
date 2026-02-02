"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { consultants } from "@/lib/mock-data/consultants";
import { tasks } from "@/lib/mock-data/tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, ClipboardList, FileText, AlertTriangle, Calendar, ArrowRight, TrendingUp } from "lucide-react";

// Mock matching data
const recentMatchings = [
  { id: "m1", taskTitle: "React Developer - Novo Nordisk", candidates: 5, topScore: 94, status: "active" },
  { id: "m2", taskTitle: "Cloud Architect - Vestas", candidates: 3, topScore: 89, status: "active" },
  { id: "m3", taskTitle: "Scrum Master - Danske Bank", candidates: 4, topScore: 85, status: "review" },
];

const pipelineData = [
  { stage: "new", count: 3, color: "bg-blue-500" },
  { stage: "inProgress", count: 5, color: "bg-yellow-500" },
  { stage: "interview", count: 2, color: "bg-purple-500" },
  { stage: "offer", count: 1, color: "bg-green-500" },
];

export function ResourceManagerDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Calculate stats from mock data
  const availableConsultants = consultants.filter(c => c.availability.status === "available");
  const needsCVUpdate = consultants.filter(c => c.cvHealthScore < 80);
  const activeTasks = tasks.filter(t => t.status === "active" || t.status === "in_progress");
  const urgentDeadlines = tasks.filter(t => {
    const deadline = new Date(t.deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.dashboard.greeting}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/matching">
              <Sparkles className="mr-2 h-4 w-4" />
              {t.dashboard.newMatching}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/consultants">{t.dashboard.seeAllConsultants}</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.activeMatchings}</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMatchings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 {t.dashboard.newThisWeek}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.availableConsultants}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableConsultants.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.dashboard.ofTotal.replace("{count}", String(consultants.length))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.needsCVUpdate}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{needsCVUpdate.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.dashboard.scoreBelow}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.openTasks}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {urgentDeadlines.length} {t.dashboard.deadlineThisWeek}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/tasks/new">
                <ClipboardList className="h-6 w-6" />
                <span>{t.dashboard.createTask}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/matching">
                <Sparkles className="h-6 w-6" />
                <span>{t.dashboard.newMatching}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/consultants">
                <Users className="h-6 w-6" />
                <span>{t.dashboard.seeConsultants}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/intro-mail">
                <FileText className="h-6 w-6" />
                <span>{t.dashboard.generateIntroMail}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Matchings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.dashboard.recentMatchings}</CardTitle>
              <CardDescription>{t.dashboard.activeRequestsAndMatches}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/matching">{t.dashboard.seeAll} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatchings.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-sm">{match.taskTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {match.candidates} {t.dashboard.candidates} • {t.dashboard.topScore}: {match.topScore}%
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/matching/${match.id}`}>{t.dashboard.seeMatches}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.pipelineOverview}</CardTitle>
            <CardDescription>{t.dashboard.statusOfActiveRequests}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium capitalize">
                    {t.dashboard[stage.stage as keyof typeof t.dashboard] || stage.stage}
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all`}
                      style={{ width: `${(stage.count / 11) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm font-semibold text-right">{stage.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consultants Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.consultantsNeedingAttention}</CardTitle>
            <CardDescription>{t.dashboard.lowCVScoreOrAvailability}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsCVUpdate.slice(0, 4).map((consultant) => (
                <div key={consultant.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <Image src={consultant.photo} alt={consultant.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{consultant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.dashboard.cvScore}: <span className="text-amber-600">{consultant.cvHealthScore}%</span>
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/consultants/${consultant.id}`}>{t.dashboard.updateCV}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.dashboard.upcomingDeadlines}</CardTitle>
              <CardDescription>{t.dashboard.tasksDueSoon}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">{t.dashboard.seeAllTasks} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => {
                const deadline = new Date(task.deadline);
                const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 3;

                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <Calendar className={`h-5 w-5 ${isUrgent ? "text-red-500" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.client}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isUrgent ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {daysUntil <= 0 ? "Overdue" : `${daysUntil}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
