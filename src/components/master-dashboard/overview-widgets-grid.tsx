/**
 * Overview widgets: Projects Summary, Publishing Queue, Finance Snapshot, Health Workload.
 * Minimal charts with teal, amber, purple; loading skeletons.
 */

import { Link } from "react-router-dom";
import { FolderKanban, FileText, Wallet, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectsSummary, useFinanceSnapshot, useHealthWorkload, usePublishingQueue } from "@/hooks/use-master-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewWidgetsGrid() {
  const projects = useProjectsSummary();
  const finance = useFinanceSnapshot();
  const health = useHealthWorkload();
  const publishing = usePublishingQueue();

  const isLoading =
    projects.isLoading || finance.isLoading || health.isLoading || publishing.isLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-white/[0.03] bg-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const projectsSummary = projects.data ?? { total: 0, active: 0, lastUpdated: "" };
  const financeSnapshot = finance.data ?? { pendingCount: 0, reconciledCount: 0, lastUpdated: "" };
  const healthWorkload = health.data ?? { activeTasks: 0, completedToday: 0, lastUpdated: "" };
  const publishingQueue = publishing.data ?? { queued: 0, inProgress: 0, published: 0, lastUpdated: "" };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Projects
          </CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{projectsSummary.total}</div>
          <p className="text-xs text-muted-foreground">{projectsSummary.active} active</p>
          <Link to="/dashboard/projects" className="text-xs text-primary hover:underline mt-1 inline-block">
            View projects
          </Link>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Publishing queue
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {publishingQueue.queued + publishingQueue.inProgress}
          </div>
          <p className="text-xs text-muted-foreground">
            {publishingQueue.queued} queued · {publishingQueue.inProgress} in progress
          </p>
          <Link to="/dashboard/content" className="text-xs text-primary hover:underline mt-1 inline-block">
            View queue
          </Link>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Finance snapshot
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {financeSnapshot.reconciledCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {financeSnapshot.pendingCount} pending reconciliation
          </p>
          <Link to="/dashboard/finance" className="text-xs text-primary hover:underline mt-1 inline-block">
            View finance
          </Link>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Health workload
          </CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {healthWorkload.activeTasks}
          </div>
          <p className="text-xs text-muted-foreground">
            {healthWorkload.completedToday} completed today
          </p>
          <Link to="/dashboard/health" className="text-xs text-primary hover:underline mt-1 inline-block">
            View health
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
