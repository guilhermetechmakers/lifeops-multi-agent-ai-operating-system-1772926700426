/**
 * RunsTimelineTable: Upcoming/last runs with status, next run time, quick actions.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CronjobRun } from "@/types/cronjob";
import { formatDistanceToNow } from "date-fns";
import { Play, ChevronRight } from "lucide-react";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

interface RunsTimelineTableProps {
  runs: CronjobRun[];
  upcoming?: { nextRun?: string }[];
  cronjobId?: string;
  onRunNow?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function RunsTimelineTable({
  runs = [],
  upcoming = [],
  cronjobId,
  onRunNow,
  isLoading = false,
  className,
}: RunsTimelineTableProps) {
  const runList = Array.isArray(runs) ? runs : [];
  const upcomingList = Array.isArray(upcoming) ? upcoming : [];

  return (
    <div className={cn("space-y-4", className)}>
      {onRunNow && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRunNow}
          disabled={isLoading}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Run now
        </Button>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Recent runs</p>
        {runList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No runs yet</p>
        ) : (
          <div className="space-y-1">
            {(runList ?? []).slice(0, 5).map((run) => {
              const status = run.status ?? "unknown";
              const variant =
                status === "success"
                  ? "default"
                  : status === "failure"
                    ? "destructive"
                    : "secondary";
              return (
                <div
                  key={run.runId}
                  className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant={variant as "default" | "destructive" | "secondary"} className="shrink-0">
                      {status}
                    </Badge>
                    <span className="text-sm text-muted-foreground truncate">
                      {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                    </span>
                    {run.durationMs != null && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDuration(run.durationMs)}
                      </span>
                    )}
                  </div>
                  {cronjobId && (
                    <Link to={`/dashboard/cronjobs/${cronjobId}/runs/${run.runId}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {upcomingList.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
          <div className="space-y-1">
            {(upcomingList ?? []).slice(0, 3).map((u, i) => (
              <div
                key={i}
                className="rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 text-sm text-muted-foreground"
              >
                Next: {u.nextRun ? new Date(u.nextRun).toLocaleString() : "—"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
