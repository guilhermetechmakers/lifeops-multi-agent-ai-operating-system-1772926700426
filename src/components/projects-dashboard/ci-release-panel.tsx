/**
 * CIReleasePanel — pipeline run cards with status and quick actions.
 */

import { Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectCI, useProjectReleases } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

export interface CIReleasePanelProps {
  projectId: string;
  className?: string;
}

const STATUS_ICONS = {
  success: CheckCircle,
  failure: XCircle,
  running: Play,
  pending: Clock,
};

export function CIReleasePanel({ projectId, className }: CIReleasePanelProps) {
  const { items: ciJobs, isLoading } = useProjectCI(projectId);
  const { items: releases } = useProjectReleases(projectId);
  const jobList = ciJobs ?? [];
  const releaseList = releases ?? [];

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
        <CardTitle className="text-base font-semibold">CI & Releases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Pipeline</p>
          <div className="space-y-2">
            {jobList.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent runs</p>
            ) : (
              jobList.map((job: { id: string; name: string; status: string }) => {
                const Icon = STATUS_ICONS[job.status as keyof typeof STATUS_ICONS] ?? Clock;
                const isSuccess = job.status === "success";
                const isFailure = job.status === "failure";
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isSuccess && "text-teal",
                          isFailure && "text-destructive"
                        )}
                      />
                      <span className="text-sm text-foreground">{job.name}</span>
                    </div>
                    {isFailure && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Re-run
                      </Button>
                    )}
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
              {releaseList.slice(0, 3).map((r: { id: string; version: string; status: string }) => (
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
