/**
 * RunHistoryPanel — run details, duration, outcome, artifacts, trace IDs.
 * Supports run list selection when multiple runs exist.
 */

import { CheckCircle, XCircle, AlertCircle, Clock, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RunRecord, RunOutcome } from "@/types/integrations";

export interface RunHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  run: RunRecord | null;
  runs?: RunRecord[];
  integrationName?: string;
  isLoadingRuns?: boolean;
  onSelectRun?: (run: RunRecord) => void;
}

const OUTCOME_CONFIG: Record<
  RunOutcome,
  { icon: typeof CheckCircle; variant: "success" | "destructive" | "warning"; label: string }
> = {
  success: { icon: CheckCircle, variant: "success", label: "Success" },
  failure: { icon: XCircle, variant: "destructive", label: "Failure" },
  partial: { icon: AlertCircle, variant: "warning", label: "Partial" },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export function RunHistoryPanel({
  open,
  onOpenChange,
  run,
  runs = [],
  integrationName = "Integration",
  isLoadingRuns = false,
  onSelectRun,
}: RunHistoryPanelProps) {
  const runList = Array.isArray(runs) ? runs : [];

  const config = run ? (OUTCOME_CONFIG[run.outcome] ?? OUTCOME_CONFIG.partial) : null;
  const OutcomeIcon = config?.icon ?? CheckCircle;
  const artifacts = run && Array.isArray(run.artifacts) ? run.artifacts : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg border-white/[0.03] bg-card"
        showClose={true}
        aria-label={run ? "Run details" : "Run history"}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {run ? (
              <>
                <OutcomeIcon
                  className={cn(
                    "h-5 w-5",
                    config?.variant === "success" && "text-teal",
                    config?.variant === "destructive" && "text-destructive",
                    config?.variant === "warning" && "text-amber"
                  )}
                  aria-hidden
                />
                Run — {integrationName}
              </>
            ) : (
              <>
                <List className="h-5 w-5 text-muted-foreground" aria-hidden />
                Run history — {integrationName}
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        {run ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={config?.variant ?? "outline"}>{config?.label ?? run.outcome}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDuration(run.durationMs)}
              </span>
              {run.traceId && (
                <span className="text-xs text-muted-foreground font-mono">
                  Trace: {run.traceId}
                </span>
              )}
            </div>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Started:</span>{" "}
                {run.startTime ? new Date(run.startTime).toLocaleString() : "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Ended:</span>{" "}
                {run.endTime ? new Date(run.endTime).toLocaleString() : "—"}
              </p>
            </div>
            {artifacts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Artifacts</h4>
                <ScrollArea className="max-h-32 rounded-md border border-white/[0.03] bg-secondary/20 p-2">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(artifacts, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : isLoadingRuns ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground" aria-live="polite">
            <Clock className="h-5 w-5 animate-pulse" aria-hidden />
            <span>Loading runs…</span>
          </div>
        ) : runList.length > 0 && onSelectRun ? (
          <ScrollArea className="max-h-[280px]">
            <div className="space-y-2 pr-2">
              {(runList as RunRecord[]).map((r) => {
                const outcomeConf = OUTCOME_CONFIG[r.outcome] ?? OUTCOME_CONFIG.partial;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRun(r)}
                    className="w-full flex items-center justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/20 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={`View run ${r.id}, ${outcomeConf.label}`}
                  >
                    <span className="text-foreground font-medium truncate">
                      {r.startTime ? new Date(r.startTime).toLocaleString() : r.id}
                    </span>
                    <Badge variant={outcomeConf.variant}>{outcomeConf.label}</Badge>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground" aria-live="polite">
            No runs yet. Trigger a test run to see history here.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
