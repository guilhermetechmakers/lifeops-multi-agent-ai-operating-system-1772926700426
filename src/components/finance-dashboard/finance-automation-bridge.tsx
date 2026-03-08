/**
 * FinanceAutomationBridge — Status strip for ingestion, categorization,
 * anomaly detection, forecasting, and monthly close workflow runs.
 * Exposes status and traces for each workflow run.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Workflow, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowRunStatus = "idle" | "running" | "completed" | "failed";

export interface WorkflowRun {
  id: string;
  name: string;
  status: WorkflowRunStatus;
  startedAt?: string;
  completedAt?: string | null;
  traceId?: string | null;
  error?: string | null;
}

interface FinanceAutomationBridgeProps {
  runs?: WorkflowRun[];
  isLoading?: boolean;
  className?: string;
}

const statusConfig: Record<
  WorkflowRunStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }
> = {
  idle: { label: "Idle", variant: "secondary", icon: Clock },
  running: { label: "Running", variant: "default", icon: Loader2 },
  completed: { label: "Done", variant: "outline", icon: CheckCircle },
  failed: { label: "Failed", variant: "destructive", icon: AlertCircle },
};

export function FinanceAutomationBridge({
  runs = [],
  isLoading,
  className,
}: FinanceAutomationBridgeProps) {
  const items = Array.isArray(runs) ? runs : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Workflow className="h-4 w-4 text-muted-foreground" />
          Automation status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recent workflow runs</p>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 pr-4">
              {items.map((run) => {
                const config = statusConfig[run.status ?? "idle"];
                const Icon = config.icon;
                return (
                  <Badge
                    key={run.id}
                    variant={config.variant}
                    className="flex items-center gap-1.5 py-1.5 text-[10px] font-medium"
                  >
                    {run.status === "running" ? (
                      <Icon className="h-3 w-3 animate-spin" aria-hidden />
                    ) : (
                      <Icon className="h-3 w-3" aria-hidden />
                    )}
                    <span>{run.name ?? "—"}</span>
                    <span className="opacity-80">{config.label}</span>
                  </Badge>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
