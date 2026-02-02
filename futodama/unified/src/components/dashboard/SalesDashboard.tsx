"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { tasks } from "@/lib/mock-data/tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, TrendingUp, Trophy, FileText, Clock, CheckCircle, XCircle, ArrowRight, Send, Eye, MessageSquare, BarChart3 } from "lucide-react";

// Mock data for sales dashboard
const introMailStats = {
  sent: 24,
  opened: 18,
  replied: 12,
};

const winLossData = {
  won: 8,
  lost: 3,
  pending: 5,
};

const recentProposals = [
  { id: "p1", client: "Novo Nordisk", consultant: "Anders Mikkelsen", sentAt: "2026-01-28", status: "opened" },
  { id: "p2", client: "Vestas", consultant: "Lars Nielsen", sentAt: "2026-01-30", status: "replied" },
  { id: "p3", client: "Danske Bank", consultant: "Sofie Andersen", sentAt: "2026-02-01", status: "sent" },
];

const pendingTasks = tasks.filter(t => t.status === "active").slice(0, 3);

export function SalesDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const winRate = Math.round((winLossData.won / (winLossData.won + winLossData.lost)) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.salesDashboard.greeting}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t.salesDashboard.salesOverview}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/intro-mail">
              <Mail className="mr-2 h-4 w-4" />
              {t.salesDashboard.introMail}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tasks/new">{t.salesDashboard.createRequest}</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.salesDashboard.activeRequests}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winLossData.pending + winLossData.won + winLossData.lost}</div>
            <p className="text-xs text-muted-foreground mt-2">+3 {t.salesDashboard.newThisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.salesDashboard.winRate}</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{winRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t.salesDashboard.wonLost}: {winLossData.won}/{winLossData.lost}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.salesDashboard.sent}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{introMailStats.sent}</div>
            <p className="text-xs text-muted-foreground mt-2">{t.salesDashboard.thisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.salesDashboard.replied}</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{introMailStats.replied}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((introMailStats.replied / introMailStats.sent) * 100)}% response rate
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
              <Link href="/intro-mail">
                <Mail className="h-6 w-6" />
                <span>{t.salesDashboard.introMail}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/tasks/new">
                <FileText className="h-6 w-6" />
                <span>{t.salesDashboard.createRequest}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/matching">
                <TrendingUp className="h-6 w-6" />
                <span>{t.salesDashboard.seeMatchings}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/reports">
                <BarChart3 className="h-6 w-6" />
                <span>{t.salesDashboard.seeReports}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Intro Mail Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Intro Mail Funnel</CardTitle>
            <CardDescription>{t.salesDashboard.statusOnProposals}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-500" />
                  {t.salesDashboard.sent}
                </div>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
                </div>
                <div className="w-12 text-sm font-semibold text-right">{introMailStats.sent}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-500" />
                  {t.salesDashboard.opened}
                </div>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(introMailStats.opened / introMailStats.sent) * 100}%` }} 
                  />
                </div>
                <div className="w-12 text-sm font-semibold text-right">{introMailStats.opened}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  {t.salesDashboard.replied}
                </div>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${(introMailStats.replied / introMailStats.sent) * 100}%` }} 
                  />
                </div>
                <div className="w-12 text-sm font-semibold text-right">{introMailStats.replied}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win/Loss */}
        <Card>
          <CardHeader>
            <CardTitle>{t.salesDashboard.winLossStatistics}</CardTitle>
            <CardDescription>{t.salesDashboard.overallWinRate}: {winRate}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{winLossData.won}</div>
                <p className="text-sm text-muted-foreground">{t.salesDashboard.won}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">{winLossData.lost}</div>
                <p className="text-sm text-muted-foreground">{t.salesDashboard.lost}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-8 w-8 text-gray-500" />
                </div>
                <div className="text-2xl font-bold">{winLossData.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Proposals & Pending Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Proposals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.salesDashboard.candidateProposal}s</CardTitle>
              <CardDescription>Recent intro mails sent</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/intro-mail">{t.dashboard.seeAll} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-sm">{proposal.consultant}</p>
                    <p className="text-xs text-muted-foreground">{proposal.client} • {proposal.sentAt}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    proposal.status === "replied" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : proposal.status === "opened"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}>
                    {proposal.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Awaiting Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.salesDashboard.tasksAwaitingCandidates}</CardTitle>
              <CardDescription>Need consultant proposals</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">{t.dashboard.seeAll} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task) => {
                const deadline = new Date(task.deadline);
                const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.client} • {t.salesDashboard.deadline}: {daysUntil}d
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/matching?task=${task.id}`}>Find {t.salesDashboard.matches}</Link>
                    </Button>
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
