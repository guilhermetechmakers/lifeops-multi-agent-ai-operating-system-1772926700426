/**
 * AdminDashboardWidgets — Compliance reports, integration status, usage controls.
 * Small cards for the User Management / Admin context.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminKpis, useAdminIntegrations } from "@/hooks/use-admin";
import { ShieldCheck, Plug, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export interface AdminDashboardWidgetsProps {
  className?: string;
}

export function AdminDashboardWidgets({ className }: AdminDashboardWidgetsProps) {
  const { data: kpis } = useAdminKpis();
  const { integrations } = useAdminIntegrations();

  const complianceStatus = kpis?.complianceStatus ?? "ok";
  const integrationsList = (integrations ?? []).filter(Boolean);
  const healthyCount = integrationsList.filter((i: { health?: string }) => i?.health === "ok").length;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              complianceStatus === "ok" && "bg-teal/20 text-teal",
              complianceStatus === "warn" && "bg-amber/20 text-amber",
              complianceStatus === "error" && "bg-destructive/20 text-destructive"
            )}
          >
            {complianceStatus === "ok" ? "Active" : complianceStatus === "warn" ? "Review" : "Alert"}
          </span>
          <Link
            to="/dashboard/admin/compliance"
            className="mt-2 block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View compliance →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Plug className="h-4 w-4" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {healthyCount} / {integrationsList.length} healthy
          </p>
          <Link
            to="/dashboard/admin/integrations"
            className="mt-2 block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage integrations →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4" />
            Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {kpis?.totalUsers ?? 0} users · {kpis?.activeOrgs ?? 0} orgs
          </p>
          <Link
            to="/dashboard/admin/reports"
            className="mt-2 block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View reports →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
