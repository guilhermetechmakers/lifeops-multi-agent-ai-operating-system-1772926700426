/**
 * Overview tab for Run Details — summary of run status, trace, logs, artifacts, timing.
 * Spec: page_run_details_010 Overview tab.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, FileText, Paperclip, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunDetail } from "@/types/run-details";
import { RUN_STATUS_LABELS } from "@/types/run-details";

function formatDuration(ms?: number): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export interface OverviewTabProps {
  run: RunDetail;
  traceCount?: number;
  logsCount?: number;
  artifactsCount?: number;
  className?: string;
}

export function OverviewTab({
  run,
  traceCount,
  logsCount,
  artifactsCount,
  className,
}: OverviewTabProps) {
  const trace = (run.trace ?? []) as unknown[];
  const logs = (run.logs ?? []) as unknown[];
  const artifacts = (run.artifacts ?? []) as unknown[];

  const traceNum = traceCount ?? trace.length;
  const logsNum = logsCount ?? logs.length;
  const artifactsNum = artifactsCount ?? artifacts.length;

  const statusVariant =
    run.status === "succeeded"
      ? "success"
      : run.status === "failed" || run.status === "halted"
        ? "destructive"
        : run.status === "running" || run.status === "paused"
          ? "warning"
          : "secondary";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
            <Badge variant={statusVariant}>
              {RUN_STATUS_LABELS[run.status] ?? run.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {run.outcome?.summary ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Trace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{traceNum}</p>
            <p className="text-xs text-muted-foreground">Messages exchanged</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{logsNum}</p>
            <p className="text-xs text-muted-foreground">Log entries</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Artifacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{artifactsNum}</p>
            <p className="text-xs text-muted-foreground">Produced</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm font-medium text-foreground">
                {run.startedAt
                  ? new Date(run.startedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ended</p>
              <p className="text-sm font-medium text-foreground">
                {run.endedAt
                  ? new Date(run.endedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">
                {formatDuration(run.durationMs)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {run.outcome != null && (
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Outcome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              {run.outcome.summary ?? (run.outcome.success ? "Success" : "Failed")}
            </p>
            {run.outcome.details != null && (
              <pre className="mt-2 rounded-md bg-secondary/50 p-3 text-xs font-mono text-foreground overflow-x-auto max-h-32 overflow-y-auto">
                {run.outcome.details}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
