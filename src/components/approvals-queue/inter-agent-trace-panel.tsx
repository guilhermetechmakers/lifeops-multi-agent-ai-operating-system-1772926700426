/**
 * Inter-agent trace timeline/flow visualization.
 */

import { MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InterAgentTracePanelProps {
  trace: Record<string, unknown> | unknown[] | null | undefined;
  className?: string;
}

interface TraceStep {
  id?: string;
  agent?: string;
  action?: string;
  timestamp?: string;
  message?: string;
}

function parseSteps(trace: Record<string, unknown> | unknown[]): TraceStep[] {
  if (Array.isArray(trace)) {
    return trace as TraceStep[];
  }
  const steps = (trace as { steps?: unknown[] }).steps;
  return Array.isArray(steps) ? (steps as TraceStep[]) : [];
}

export function InterAgentTracePanel({ trace, className }: InterAgentTracePanelProps) {
  if (trace == null) {
    return (
      <p className="text-sm text-muted-foreground py-4">No trace data</p>
    );
  }

  const steps = parseSteps(
    typeof trace === "object" && trace !== null ? trace : {}
  );

  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No trace steps</p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, i) => (
        <div key={step.id ?? i} className="flex items-start gap-3">
          <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-secondary border border-white/[0.03]">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1 rounded-lg border border-white/[0.03] bg-secondary/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {step.agent && (
                <span className="text-sm font-medium text-foreground">
                  {step.agent}
                </span>
              )}
              {step.action && (
                <span className="text-xs text-muted-foreground">{step.action}</span>
              )}
              {step.timestamp && (
                <span className="text-xs text-muted-foreground">
                  {new Date(step.timestamp).toLocaleString()}
                </span>
              )}
            </div>
            {step.message && (
              <p className="mt-1 text-sm text-muted-foreground">{step.message}</p>
            )}
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
