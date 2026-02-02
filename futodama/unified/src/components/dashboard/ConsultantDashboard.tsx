"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { consultants } from "@/lib/mock-data/consultants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, AlertCircle, Lightbulb, Briefcase, Calendar, TrendingUp } from "lucide-react";

// Mock data for consultant's personal dashboard
const mockCVVersions = [
  { id: "v1", name: "CV_2026_01.pdf", createdAt: "2026-01-15", isLatest: true },
  { id: "v2", name: "CV_2025_11.pdf", createdAt: "2025-11-20", isLatest: false },
  { id: "v3", name: "CV_2025_08.pdf", createdAt: "2025-08-10", isLatest: false },
];

const mockActiveMatches = [
  { id: "m1", taskTitle: "React Developer - Novo Nordisk", matchScore: 92, status: "shortlisted" },
  { id: "m2", taskTitle: "Full-Stack Lead - LEGO", matchScore: 87, status: "reviewing" },
];

const mockUpcomingProjects = [
  { id: "p1", client: "Novo Nordisk", role: "Lead Developer", startDate: "2026-02-15" },
];

export function ConsultantDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Get consultant data (in real app, would fetch based on user)
  const consultant = consultants[0]; // Anders Mikkelsen
  const healthScore = consultant?.cvHealthScore || 85;

  // Mock improvements based on score
  const improvements = healthScore < 90 ? [
    { id: "1", priority: "high", text: t.consultantDashboard.addTechnicalDetails },
    { id: "2", priority: "medium", text: t.consultantDashboard.updateCloudCerts },
    { id: "3", priority: "medium", text: t.consultantDashboard.addMeasurableResults },
  ] : [];

  const strengths = [
    t.consultantDashboard.strongTechDescription,
    t.consultantDashboard.goodBalance,
    t.consultantDashboard.updatedCertifications,
  ];

  // Health score color
  const scoreColor = healthScore >= 85 ? "text-green-600" : healthScore >= 70 ? "text-amber-600" : "text-red-600";
  const scoreBg = healthScore >= 85 ? "bg-green-500" : healthScore >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.consultantDashboard.welcomeBack}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t.consultantDashboard.profileOverview}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/consultants/${consultant?.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              {t.consultantDashboard.editCV}
            </Link>
          </Button>
          <Button asChild>
            <Download className="mr-2 h-4 w-4" />
            {t.consultantDashboard.exportCV}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.consultantDashboard.cvHealthScore}</CardTitle>
            <TrendingUp className={`h-4 w-4 ${scoreColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${scoreColor}`}>{healthScore}%</div>
            <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${scoreBg} rounded-full`} style={{ width: `${healthScore}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+5% {t.consultantDashboard.fromLastMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.consultantDashboard.cvVersions}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCVVersions.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t.consultantDashboard.latest}: {mockCVVersions[0].createdAt}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.consultantDashboard.activeMatches}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockActiveMatches.length}</div>
            <p className="text-xs text-muted-foreground mt-2">{t.consultantDashboard.newTasksMatchingYou}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.consultantDashboard.upcomingProjects}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUpcomingProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockUpcomingProjects[0]?.client || t.consultantDashboard.noPlannedProjects}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CV Health Check */}
        <Card>
          <CardHeader>
            <CardTitle>{t.consultantDashboard.cvHealthCheck}</CardTitle>
            <CardDescription>{t.consultantDashboard.aiSuggestions}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strengths */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{t.consultantDashboard.whatsWorking}</span>
              </div>
              <div className="space-y-2">
                {strengths.map((strength, i) => (
                  <p key={i} className="text-sm text-muted-foreground pl-6">{strength}</p>
                ))}
              </div>
            </div>

            {/* Improvements */}
            {improvements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">{t.consultantDashboard.prioritizedImprovements}</span>
                </div>
                <div className="space-y-2">
                  {improvements.map((improvement) => (
                    <div key={improvement.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{improvement.text}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          improvement.priority === "high" 
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {improvement.priority === "high" ? t.consultantDashboard.high : t.consultantDashboard.medium}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`/consultants/${consultant?.id}`}>{t.consultantDashboard.improveMyCV}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My CVs */}
        <Card>
          <CardHeader>
            <CardTitle>{t.consultantDashboard.myCVs}</CardTitle>
            <CardDescription>{t.consultantDashboard.savedCVVersions}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCVVersions.map((cv) => (
                <div key={cv.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{cv.name}</p>
                      <p className="text-xs text-muted-foreground">{cv.createdAt}</p>
                    </div>
                    {cv.isLatest && (
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                        {t.consultantDashboard.latest}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Matches */}
      <Card>
        <CardHeader>
          <CardTitle>{t.consultantDashboard.activeMatches}</CardTitle>
          <CardDescription>{t.consultantDashboard.newTasksMatchingYou}</CardDescription>
        </CardHeader>
        <CardContent>
          {mockActiveMatches.length > 0 ? (
            <div className="space-y-3">
              {mockActiveMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium">{match.taskTitle}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        Match: <span className="text-green-600 font-semibold">{match.matchScore}%</span>
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        match.status === "shortlisted" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No active matches at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
