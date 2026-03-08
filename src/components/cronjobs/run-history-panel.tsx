/**
 * RunHistoryPanel: per-cronjob run history with status and date filters.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, SkipForward, Loader2 } from "lucide-react";
import { useCronjobRuns } from "@/hooks/use-cronjobs";
import { formatDistanceToNow } from "date-fns";
import type { CronjobRunStatus } from "@/types/cronjob";
import { cn } from "@/lib/utils";

function StatusIcon({ status }: { status: CronjobRunStatus }) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-teal" />;
    case "failure":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-amber" />;
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    default:
      return null;
  }
}

export interface RunHistoryPanelProps {
  cronjobId: string;
  cronjobName?: string;
  className?: string;
  /** When set, clicking a run calls this instead of navigating (e.g. for detail drawer). */
  onSelectRun?: (runId: string) => void;
}

export function RunHistoryPanel({
  cronjobId,
  className,
  onSelectRun,
}: RunHistoryPanelProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { items: runs, isLoading } = useCronjobRuns(cronjobId, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const list = useMemo(() => runs ?? [], [runs]);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Run history</CardTitle>
        <div className="flex gap-2">
          {(["all", "success", "failure", "skipped"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">
            No runs yet. Trigger a run to see history.
          </div>
        ) : (
          <ul className="space-y-2">
            {(list ?? []).map((run) => (
              <li
                key={run.runId}
                className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2 transition-colors hover:bg-secondary/70"
              >
                {onSelectRun ? (
                  <button
                    type="button"
                    onClick={() => onSelectRun(run.runId)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                  <StatusIcon status={run.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-foreground">
                      {run.runId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                      {run.durationMs > 0 && ` · ${(run.durationMs / 1000).toFixed(1)}s`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      run.status === "success"
                        ? "success"
                        : run.status === "failure"
                          ? "destructive"
                          : run.status === "skipped"
                            ? "warning"
                            : "secondary"
                    }
                  >
                    {run.status}
                  </Badge>
                </button>
                ) : (
                <Link
                  to={`/dashboard/cronjobs/${cronjobId}/runs/${run.runId}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <StatusIcon status={run.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-foreground">
                      {run.runId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                      {run.durationMs > 0 && ` · ${(run.durationMs / 1000).toFixed(1)}s`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      run.status === "success"
                        ? "success"
                        : run.status === "failure"
                          ? "destructive"
                          : run.status === "skipped"
                            ? "warning"
                            : "secondary"
                    }
                  >
                    {run.status}
                  </Badge>
                </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
