import { Link } from "react-router-dom";
import {
  Clock,
  CheckSquare,
  AlertCircle,
  Plus,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import { useCommandPalette } from "@/contexts/command-palette-context";
import {
  useMasterCronjobs,
  useMasterApprovals,
  useMasterAlerts,
} from "@/hooks/use-master-dashboard";
import {
  ActiveCronjobsSnapshot,
  CrossModuleAlertsPanel,
  QuickAccessWorkflows,
  AgentTemplatesCatalog,
  OverviewWidgetsGrid,
  CronjobsDashboardLink,
  ChartPanel,
  ApprovalsQueueWidget,
} from "@/components/master-dashboard";
import { NotificationCenter } from "@/components/notifications";

export default function DashboardMaster() {
  const { setOpen: setCommandOpen } = useCommandPalette();
  const { items: cronjobs } = useMasterCronjobs();
  const { items: approvals } = useMasterApprovals();
  const { items: alerts } = useMasterAlerts();

  const cronjobList = cronjobs ?? [];
  const approvalList = approvals ?? [];
  const pendingCount = approvalList.filter((p) => p.status === "pending").length;
  const alertList = alerts ?? [];
  const activeCronjobs = cronjobList.filter((c) => c.enabled).length;
  const criticalAlerts = alertList.filter(
    (a) => a.severity === "critical" || a.severity === "error"
  ).length;

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          Master Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Link to="/dashboard/cronjobs/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New cronjob
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OverviewWidgetsGrid />

          <div className="grid gap-4 md:grid-cols-2">
            <QuickAccessWorkflows />
            <ActiveCronjobsSnapshot />
          </div>

          <AgentTemplatesCatalog />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Cronjob metrics & alert trends
            </h2>
            <ChartPanel />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active cronjobs
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {activeCronjobs}
                </div>
                <p className="text-xs text-muted-foreground">
                  {cronjobList.length} total
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending approvals
                </CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {pendingCount}
                </div>
                <Link
                  to="/dashboard/approvals"
                  className="text-xs text-primary hover:underline"
                >
                  Review queue
                </Link>
              </CardContent>
            </Card>
            <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Agent health
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      criticalAlerts > 0 ? "destructive" : "success"
                    }
                  >
                    {criticalAlerts > 0
                      ? `${criticalAlerts} critical`
                      : "All healthy"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <CronjobsDashboardLink />

          <ApprovalsQueueWidget />

          <NotificationCenter maxHeight="500px" />

          <CrossModuleAlertsPanel />
        </div>
      </div>
    </AnimatedPage>
  );
}
