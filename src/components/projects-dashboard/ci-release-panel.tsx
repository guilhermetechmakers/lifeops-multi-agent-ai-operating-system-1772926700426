/**
 * CIReleasePanel — pipeline run cards with status, duration, and quick actions (re-run, view logs).
 */

import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Play, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectCI, useProjectReleases } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { CIJob } from "@/types/projects";

export interface CIReleasePanelProps {
  projectId: string;
  className?: string;
}

const STATUS_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  failure: XCircle,
  running: Play,
  pending: Clock,
};

export function CIReleasePanel({ projectId, className }: CIReleasePanelProps) {
  const { items: ciJobs, isLoading } = useProjectCI(projectId);
  const { items: releases } = useProjectReleases(projectId);
  const jobList = Array.isArray(ciJobs) ? ciJobs : [];
  const releaseList = Array.isArray(releases) ? releases : [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">CI & Releases</CardTitle>
          <Link to={`/dashboard/projects/${projectId}/ci-integrations`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
              Manage
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Pipeline</p>
          <div className="space-y-2">
            {jobList.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent runs</p>
            ) : (
              (jobList as CIJob[]).map((job) => {
                const Icon = STATUS_ICONS[job.status] ?? Clock;
                const isSuccess = job.status === "success";
                const isFailure = job.status === "failure";
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSuccess && "text-teal",
                          isFailure && "text-destructive"
                        )}
                        aria-hidden
                      />
                      <span className="text-sm text-foreground truncate">{job.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {job.runId && (
                        <Link to={`/dashboard/runs/${job.runId}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" aria-label={`View logs for ${job.name}`}>
                            <FileText className="h-3 w-3" />
                            Logs
                          </Button>
                        </Link>
                      )}
                      {isFailure && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                          Re-run
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {releaseList.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Releases</p>
            <div className="space-y-1">
              {releaseList.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="text-foreground">{r.version}</span>
                  <span className="text-xs text-muted-foreground">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
