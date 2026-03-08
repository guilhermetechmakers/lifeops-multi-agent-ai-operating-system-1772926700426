/**
 * RunDetailsPanel: Compact run view with inputs, trace, logs, artifacts, outcome.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CronjobRun } from "@/types/cronjob";
import { ArrowRight, FileText, Activity, FolderOpen, RotateCcw } from "lucide-react";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

interface RunDetailsPanelProps {
  run: CronjobRun | null;
  cronjobId?: string;
  onRevert?: (runId: string) => void;
  className?: string;
}

export function RunDetailsPanel({
  run,
  cronjobId,
  onRevert,
  className,
}: RunDetailsPanelProps) {
  if (!run) {
    return (
      <div
        className={cn(
          "rounded-lg border border-white/[0.03] bg-secondary/30 p-6 text-center text-muted-foreground text-sm",
          className
        )}
      >
        No run selected. Trigger a run or select from the timeline.
      </div>
    );
  }

  const status = run.status ?? "unknown";
  const variant =
    status === "success"
      ? "default"
      : status === "failure"
        ? "destructive"
        : "secondary";

  const logs = (run.logs ?? []) as string[];
  const artifacts = (run.artifacts ?? []) as unknown[];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Badge variant={variant as "default" | "destructive" | "secondary"}>
          {status}
        </Badge>
        {cronjobId && (
          <Link to={`/dashboard/cronjobs/${cronjobId}/runs/${run.runId}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              View full details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-2 text-sm">
        <p className="text-muted-foreground">
          Started: {new Date(run.startedAt).toLocaleString()}
        </p>
        <p className="text-muted-foreground">
          Duration: {formatDuration(run.durationMs ?? 0)}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4" />
          Trace
        </div>
        <div className="rounded-md border border-white/[0.03] bg-input p-3 text-xs font-mono">
          {run.trace ? (
            <pre className="overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(run.trace, null, 2)}
            </pre>
          ) : (
            <span className="text-muted-foreground">No trace data</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" />
          Logs
        </div>
        <ScrollArea className="h-24 rounded-md border border-white/[0.03] bg-input p-3">
          <pre className="text-xs font-mono">
            {(logs ?? []).length > 0
              ? logs.join("\n")
              : "No logs"}
          </pre>
        </ScrollArea>
      </div>

      {(artifacts ?? []).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FolderOpen className="h-4 w-4" />
            Artifacts ({artifacts.length})
          </div>
          <p className="text-xs text-muted-foreground">
            {artifacts.length} artifact(s) produced
          </p>
        </div>
      )}

      {onRevert && status === "success" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRevert(run.runId)}
          className="gap-2 text-amber"
        >
          <RotateCcw className="h-4 w-4" />
          Revert actions
        </Button>
      )}
    </div>
  );
}
