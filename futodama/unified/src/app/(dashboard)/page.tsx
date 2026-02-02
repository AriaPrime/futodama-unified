"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ResourceManagerDashboard, ConsultantDashboard, SalesDashboard } from "@/components/dashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  // Render dashboard based on user role
  switch (user?.role) {
    case "consultant":
      return <ConsultantDashboard />;
    case "sales":
      return <SalesDashboard />;
    case "resource_manager":
    default:
      // Default to resource manager dashboard (also for unauthenticated/demo)
      return <ResourceManagerDashboard />;
  }
}
