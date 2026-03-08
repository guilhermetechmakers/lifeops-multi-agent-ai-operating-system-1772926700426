/**
 * AdminOverview — KPIs, users by role, active sessions, recent activity, policy status.
 * Dense, scannable layout with card hierarchy per design spec.
 */

import { Users, Building2, FileText, Clock, ShieldCheck, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./kpi-card";
import { AdminDashboardWidgets } from "./admin-dashboard-widgets";
import { useAdminKpis, useComplianceAudits } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function AdminOverview() {
  const { data: kpis, isLoading } = useAdminKpis();
  const { audits = [] } = useComplianceAudits();

  const totalUsers = kpis?.totalUsers ?? 0;
  const activeOrgs = kpis?.activeOrgs ?? 0;
  const totalInvoices = kpis?.totalInvoices ?? 0;
  const upcomingCronjobs = kpis?.upcomingCronjobs ?? 0;
  const activeSessionsCount = kpis?.activeSessionsCount ?? 0;
  const usersByRole = (kpis?.usersByRole && typeof kpis.usersByRole === "object") ? kpis.usersByRole : {};
  const complianceStatus = (kpis?.complianceStatus === "ok" || kpis?.complianceStatus === "warn" || kpis?.complianceStatus === "error")
    ? kpis.complianceStatus
    : "ok";

  const recentAudits = Array.isArray(audits) ? audits.slice(0, 5) : [];
  const roleEntries = Object.entries(usersByRole ?? {});

  if (isLoading) {
    return (
      <AnimatedPage className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-secondary/50" />
          ))}
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-8">
      <AdminDashboardWidgets />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KPICard title="Total users" value={totalUsers} icon={Users} />
        <KPICard title="Active orgs" value={activeOrgs} icon={Building2} />
        <KPICard title="Active sessions" value={activeSessionsCount} icon={Monitor} />
        <KPICard title="Total invoices" value={totalInvoices} icon={FileText} />
        <KPICard title="Upcoming cronjobs" value={upcomingCronjobs} icon={Clock} />
        <KPICard
          title="Compliance"
          value={complianceStatus}
          icon={ShieldCheck}
          trend={complianceStatus === "ok" ? "up" : complianceStatus === "error" ? "down" : "neutral"}
          trendLabel={complianceStatus === "ok" ? "All clear" : complianceStatus === "error" ? "Action needed" : "Review"}
        />
      </div>

      {roleEntries.length > 0 && (
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle>Users by role</CardTitle>
            <p className="text-sm text-muted-foreground">
              Role distribution across organizations
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {roleEntries.map(([roleName, count]) => (
                <Link
                  key={roleName}
                  to={`/dashboard/admin/users?role=${encodeURIComponent(roleName)}`}
                  className="rounded-lg border border-white/[0.03] bg-secondary/30 px-4 py-2 text-sm transition-colors duration-200 hover:bg-secondary/60 hover:border-white/[0.06]"
                >
                  <span className="font-medium text-foreground">{roleName}</span>
                  <span className="ml-2 text-muted-foreground">{Number(count)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest audit events across organizations
            </p>
          </CardHeader>
          <CardContent>
            {(recentAudits ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              <ul className="space-y-3">
                {recentAudits.map((a: { id?: string; action?: string; timestamp?: string }) => (
                  <li
                    key={a?.id ?? ""}
                    className="flex items-center justify-between rounded-md border border-white/[0.03] px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">{a?.action ?? "—"}</span>
                    <span className="text-muted-foreground">
                      {a?.timestamp
                        ? new Date(a.timestamp).toLocaleDateString()
                        : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle>Policy status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Data retention and compliance policies
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border border-white/[0.03] px-3 py-2">
                <span className="text-sm text-foreground">Data retention</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    complianceStatus === "ok" && "bg-teal/20 text-teal",
                    complianceStatus === "warn" && "bg-amber/20 text-amber",
                    complianceStatus === "error" && "bg-[#FF3B30]/20 text-[#FF3B30]"
                  )}
                >
                  {complianceStatus === "ok" ? "Active" : complianceStatus === "warn" ? "Review" : "Alert"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-white/[0.03] px-3 py-2">
                <span className="text-sm text-foreground">Audit logging</span>
                <span className="rounded-full bg-teal/20 px-2 py-0.5 text-xs font-medium text-teal">
                  Enabled
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
