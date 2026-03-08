/**
 * CronjobsDashboardLink — link to Cronjobs with next run time and last run outcome.
 */

import { Link } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectCronjobs } from "@/hooks/use-projects";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export interface CronjobsDashboardLinkProps {
  projectId: string;
  className?: string;
}

export function CronjobsDashboardLink({ projectId, className }: CronjobsDashboardLinkProps) {
  const { items: cronjobs, isLoading } = useProjectCronjobs(projectId);
  const list = Array.isArray(cronjobs) ? cronjobs : [];
  const firstCronjob = list[0];
  const nextRun = firstCronjob?.nextRun;
  const lastRun = firstCronjob?.lastRun;

  if (isLoading) {
    return (
      <Card className={cn("card-project-detail", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to="/dashboard/cronjobs">
      <Card className={cn("card-project-detail hover:border-white/[0.06]", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Cronjobs
            <ChevronRight className="h-4 w-4 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cronjobs for this project</p>
          ) : (
            <div className="space-y-1">
              {nextRun && (
                <p className="text-xs text-muted-foreground">
                  Next: {formatDistanceToNow(new Date(nextRun), { addSuffix: true })}
                </p>
              )}
              {lastRun && (
                <Badge
                  variant={lastRun.status === "success" ? "success" : "destructive"}
                  className="text-[10px]"
                >
                  Last: {lastRun.status}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
