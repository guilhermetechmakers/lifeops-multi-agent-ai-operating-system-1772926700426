/**
 * RunDetailsHeader — Run ID, cronjob name, status badge, times, duration, actions (Revert, Re-run, Export).
 * Status badge uses color semantics; Revert enabled only when run is reversible and validators pass.
 */

import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RunDetail } from "@/types/run-details";
import { RUN_STATUS_LABELS } from "@/types/run-details";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

const STATUS_VARIANT: Record<
  RunDetail["status"],
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  queued: "secondary",
  running: "warning",
  succeeded: "success",
  failed: "destructive",
  aborted: "secondary",
  reverted: "secondary",
};

export interface RunDetailsHeaderProps {
  run: RunDetail | null;
  canRevert: boolean;
  revertDisabledReason?: string;
  onRevert?: () => void;
  onReRun?: () => void;
  onExportArtifacts?: () => void;
  isReverting?: boolean;
  className?: string;
}

export function RunDetailsHeader({
  run,
  canRevert,
  revertDisabledReason,
  onRevert,
  onReRun,
  onExportArtifacts,
  isReverting = false,
  className,
}: RunDetailsHeaderProps) {
  const { id: cronjobId } = useParams<{ id?: string; runId?: string }>();
  const backHref = cronjobId
    ? `/dashboard/cronjobs/${cronjobId}`
    : run?.cronjobId
      ? `/dashboard/cronjobs/${run.cronjobId}`
      : "/dashboard/cronjobs";
  const [copied, setCopied] = useState(false);

  const copyRunId = () => {
    if (!run?.id) return;
    void navigator.clipboard.writeText(run.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!run) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardContent className="flex items-center gap-4 p-6">
          <p className="text-sm text-muted-foreground">Loading run…</p>
        </CardContent>
      </Card>
    );
  }

  const statusVariant = STATUS_VARIANT[run.status] ?? "secondary";

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <Link
              to={backHref}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Back to cronjob"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  {run.cronjobName}
                </h1>
                <Badge variant={statusVariant} className="shrink-0">
                  {RUN_STATUS_LABELS[run.status] ?? run.status}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono">{run.id}</span>
                <button
                  type="button"
                  onClick={copyRunId}
                  className="inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Copy run ID"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-teal" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <span>Started: {formatTime(run.startedAt)}</span>
                <span>Ended: {run.endedAt ? formatTime(run.endedAt) : "—"}</span>
                {run.durationMs != null && (
                  <span>Duration: {formatDuration(run.durationMs)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {onRevert && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRevert}
                disabled={!canRevert || isReverting}
                title={!canRevert ? revertDisabledReason : undefined}
                className="gap-2 text-amber focus-visible:ring-amber/50"
                aria-label={canRevert ? "Revert run actions" : revertDisabledReason ?? "Revert not available"}
              >
                <RotateCcw className="h-4 w-4" />
                {isReverting ? "Reverting…" : "Revert"}
              </Button>
            )}
            {onReRun && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReRun}
                className="gap-2"
                aria-label="Re-run this cronjob"
              >
                <Play className="h-4 w-4" />
                Re-run
              </Button>
            )}
            {onExportArtifacts && (run.artifacts?.length ?? 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportArtifacts}
                className="gap-2"
                aria-label="Export artifacts"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
