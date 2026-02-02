"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { notifications as mockNotifications } from "@/lib/mock-data/notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCircle, 
  Users, 
  Calendar, 
  AlertCircle,
  Check,
  Trash2
} from "lucide-react";
import type { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "matches" | "reminders">("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    if (activeTab === "matches") return n.type === "match" || n.type === "new_match";
    if (activeTab === "reminders") return n.type === "reminder" || n.type === "deadline" || n.type === "cv_reminder";
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "match":
      case "new_match":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "reminder":
      case "deadline":
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case "alert":
      case "cv_reminder":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "system":
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} ${t.notifications.minAgo}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t.notifications.hoursAgo}`;
    } else if (diffDays === 1) {
      return t.notifications.yesterday;
    } else {
      return `${diffDays} ${t.notifications.daysAgo}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="h-8 w-8" />
            {t.notifications.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} ${t.notifications.unread}` : t.notifications.noUnread}
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCircle className="mr-2 h-4 w-4" />
          {t.notifications.markAllRead}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all">{t.notifications.all}</TabsTrigger>
          <TabsTrigger value="unread">
            {t.notifications.unreadTab}
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="matches">{t.notifications.matches}</TabsTrigger>
          <TabsTrigger value="reminders">{t.notifications.reminders}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {activeTab === "all" && t.notifications.noNotifications}
                  {activeTab === "unread" && t.notifications.allRead}
                  {activeTab === "matches" && t.notifications.noMatchNotifications}
                  {activeTab === "reminders" && t.notifications.noReminders}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="divide-y divide-gray-100 dark:divide-gray-800 p-0">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 transition-colors ${
                      !notification.read 
                        ? "bg-blue-50/50 dark:bg-blue-900/10" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              {t.notifications.markAsRead}
                            </Button>
                          )}
                          {notification.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              asChild
                            >
                              <a href={notification.link}>{t.notifications.seeDetails}</a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
