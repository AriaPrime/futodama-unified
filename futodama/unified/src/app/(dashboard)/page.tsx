"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, ClipboardList, FileText } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard.greeting}, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.subtitle}
          </p>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/matching">
                <Sparkles className="h-6 w-6" />
                <span>{t.dashboard.newMatching}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/tasks/new">
                <ClipboardList className="h-6 w-6" />
                <span>{t.dashboard.createTask}</span>
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.activeMatchings}</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-2">
              +2 {t.dashboard.newThisWeek}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.availableConsultants}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t.dashboard.ofTotal.replace("{count}", "10")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.needsCVUpdate}</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">3</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t.dashboard.scoreBelow}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.openTasks}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-2">
              2 {t.dashboard.deadlineThisWeek}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future content */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentMatchings}</CardTitle>
          <CardDescription>{t.dashboard.activeRequestsAndMatches}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Dashboard content coming in Phase 3...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
