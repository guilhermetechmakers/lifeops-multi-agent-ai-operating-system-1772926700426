/**
 * PipelineSummaryCard — shows progress, ETA, last action for content pipelines.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Workflow, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { usePipelineRuns } from "@/hooks/use-content-dashboard";
import type { PipelineRunSummary } from "@/types/content-dashboard";

function StatusIcon({ status }: { status: PipelineRunSummary["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-amber" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-teal" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export interface PipelineSummaryCardProps {
  className?: string;
}

export function PipelineSummaryCard({ className }: PipelineSummaryCardProps) {
  const { items, isLoading } = usePipelineRuns();
  const runs = Array.isArray(items) ? items : [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Workflow className="h-5 w-5 text-purple" />
          Content Pipelines
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Progress, ETA, last action
        </p>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pipelines running
          </p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {(runs ?? []).map((run) => (
              <Link
                key={run.id}
                to={`/dashboard/content/editor?itemId=${run.draftId}`}
                className="block rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {run.contentTitle ?? "Untitled"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <StatusIcon status={run.status} />
                      <span className="capitalize">{run.status}</span>
                      {run.currentStep && (
                        <span>· {run.currentStep}</span>
                      )}
                      {run.progress != null && (
                        <span>· {run.progress}%</span>
                      )}
                    </div>
                    {run.lastAction && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {run.lastAction}
                      </p>
                    )}
                    {run.eta && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        ETA: {run.eta}
                      </p>
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
