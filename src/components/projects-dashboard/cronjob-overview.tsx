/**
 * CronjobOverview — next run, last run, per-run details.
 */

import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectCronjobs } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { ProjectCronjobOverview } from "@/types/projects";

export interface CronjobOverviewProps {
  projectId: string;
  className?: string;
}

export function CronjobOverview({ projectId, className }: CronjobOverviewProps) {
  const { items: cronjobs, isLoading } = useProjectCronjobs(projectId);
  const list = Array.isArray(cronjobs) ? (cronjobs as ProjectCronjobOverview[]) : [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Cronjobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No cronjobs
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((cj) => (
              <Link key={cj.id} to={`/dashboard/cronjobs/${cj.id}`}>
                <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors">
                  <p className="text-sm font-medium text-foreground">{cj.name}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    {cj.nextRun && (
                      <span>Next: {formatDistanceToNow(new Date(cj.nextRun), { addSuffix: true })}</span>
                    )}
                    {cj.lastRun && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-teal" />
                        {cj.lastRun.status}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
