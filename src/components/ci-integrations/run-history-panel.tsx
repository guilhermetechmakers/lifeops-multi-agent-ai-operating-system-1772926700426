/**
 * RunHistoryPanel — run details, duration, outcome, artifacts, trace IDs.
 */

import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
  integrationName?: string;
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
  integrationName = "Integration",
}: RunHistoryPanelProps) {
  if (!run) return null;

  const config = OUTCOME_CONFIG[run.outcome] ?? OUTCOME_CONFIG.partial;
  const Icon = config.icon;
  const artifacts = Array.isArray(run.artifacts) ? run.artifacts : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg border-white/[0.03] bg-card"
        showClose={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-5 w-5",
                config.variant === "success" && "text-teal",
                config.variant === "destructive" && "text-destructive",
                config.variant === "warning" && "text-amber"
              )}
            />
            Run — {integrationName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
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
      </DialogContent>
    </Dialog>
  );
}
