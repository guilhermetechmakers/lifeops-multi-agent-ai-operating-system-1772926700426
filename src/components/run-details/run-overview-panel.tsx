/**
 * RunOverviewPanel — run status, schedule, target, inputs, constraints, permissions, TTLs.
 * Overview for orchestration runs with all key metadata.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Clock, Target, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RunDetail, RunSchedule, RunTarget, RunTTLMetadata } from "@/types/run-details";
import { RUN_STATUS_LABELS } from "@/types/run-details";

function formatNextRun(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatTTL(seconds?: number): string {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

export interface RunOverviewPanelProps {
  run: RunDetail | null;
  className?: string;
}

export function RunOverviewPanel({ run, className }: RunOverviewPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!run) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">No run data</p>
        </CardContent>
      </Card>
    );
  }

  const schedule = run.schedule as RunSchedule | undefined;
  const target = run.target as RunTarget | undefined;
  const ttl = run.ttlMetadata as RunTTLMetadata | undefined;
  const constraints = run.constraints;

  const statusVariant =
    run.status === "succeeded"
      ? "success"
      : run.status === "failed" || run.status === "aborted"
        ? "destructive"
        : run.status === "running"
          ? "warning"
          : "secondary";

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader
        className="cursor-pointer select-none p-4 md:p-5"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            Run Overview
          </CardTitle>
          <Badge variant={statusVariant}>
            {RUN_STATUS_LABELS[run.status] ?? run.status}
          </Badge>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="border-t border-white/[0.03] pt-4 space-y-4">
          {/* Schedule */}
          {schedule && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Schedule
              </div>
              <div className="rounded-md border border-white/[0.06] bg-secondary/20 px-3 py-2 font-mono text-xs text-foreground">
                {schedule.cron ?? "—"} {schedule.timeZone ? `(${schedule.timeZone})` : ""}
              </div>
              {schedule.nextRunAt && (
                <p className="text-xs text-muted-foreground">
                  Next run: {formatNextRun(schedule.nextRunAt)}
                </p>
              )}
            </div>
          )}

          {/* Target */}
          {target != null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Target
              </div>
              <p className="font-mono text-xs text-foreground">
                {typeof target === "object"
                  ? (target.name ?? target.id ?? target.type ?? "—")
                  : String(target)}
              </p>
              {typeof target === "object" && target.type && (
                <span className="text-xs text-muted-foreground">{target.type}</span>
              )}
            </div>
          )}

          {/* Constraints */}
          {constraints && Object.keys(constraints).length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Constraints
              </div>
              <div className="rounded-md border border-white/[0.06] bg-secondary/20 px-3 py-2 text-xs text-foreground space-y-1">
                {constraints.maxDurationMs != null && (
                  <p>Max duration: {(constraints.maxDurationMs / 1000).toFixed(0)}s</p>
                )}
                {constraints.maxRetries != null && (
                  <p>Max retries: {constraints.maxRetries}</p>
                )}
                {constraints.deadline != null && (
                  <p>Deadline: {constraints.deadline}</p>
                )}
              </div>
            </div>
          )}

          {/* Permissions */}
          {Array.isArray(run.permissions) && run.permissions.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Permissions</span>
              <p className="font-mono text-xs text-foreground">
                {(run.permissions ?? []).join(", ")}
              </p>
            </div>
          )}

          {/* TTL Metadata */}
          {ttl && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                TTLs
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {ttl.memoryScope != null && (
                  <span className="rounded bg-secondary/50 px-2 py-0.5">
                    Memory: {formatTTL(ttl.memoryScope)}
                  </span>
                )}
                {ttl.messageRetention != null && (
                  <span className="rounded bg-secondary/50 px-2 py-0.5">
                    Messages: {formatTTL(ttl.messageRetention)}
                  </span>
                )}
                {ttl.artifactRetention != null && (
                  <span className="rounded bg-secondary/50 px-2 py-0.5">
                    Artifacts: {formatTTL(ttl.artifactRetention)}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
