/**
 * VariableStatesInspector — agent-local variables across steps; current vs previous state diff.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TraceStep } from "@/types/agent-trace";

export interface VariableStatesInspectorProps {
  steps: TraceStep[];
  currentStepIndex: number;
  selectedAgentId?: string | null;
  className?: string;
}

function diffKeys(prev: Record<string, unknown>, curr: Record<string, unknown>): string[] {
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(curr ?? {})]);
  return [...keys].filter((k) => {
    const p = JSON.stringify((prev ?? {})[k]);
    const c = JSON.stringify((curr ?? {})[k]);
    return p !== c;
  });
}

export function VariableStatesInspector({
  steps,
  currentStepIndex,
  selectedAgentId,
  className,
}: VariableStatesInspectorProps) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const currentStep = safeSteps[currentStepIndex] ?? null;
  const previousStep = currentStepIndex > 0 ? safeSteps[currentStepIndex - 1] ?? null : null;

  const { currentState, previousState, changedKeys } = useMemo(() => {
    const curr = (currentStep?.memorySnapshot ?? {}) as Record<string, unknown>;
    const prev = (previousStep?.memorySnapshot ?? {}) as Record<string, unknown>;
    const keys = diffKeys(prev, curr);
    return {
      currentState: curr,
      previousState: prev,
      changedKeys: keys,
    };
  }, [currentStep?.memorySnapshot, previousStep?.memorySnapshot]);

  const entries = Object.entries(currentState);
  const hasState = entries.length > 0;

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">Variable States</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Step {currentStepIndex + 1} of {safeSteps.length}
          {selectedAgentId && ` · Agent: ${selectedAgentId}`}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[200px] rounded-md border border-white/[0.03] bg-secondary/30">
          {!hasState ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No variable state for this step
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-secondary/90 text-muted-foreground">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Key</th>
                  <th className="text-left py-2 px-3 font-medium">Value</th>
                  <th className="text-left py-2 px-3 font-medium w-16">Δ</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([key, value]) => {
                  const isChanged = changedKeys.includes(key);
                  const prevVal = previousState[key];
                  return (
                    <tr
                      key={key}
                      className={cn(
                        "border-t border-white/[0.03] hover:bg-white/[0.02]",
                        isChanged && "bg-amber/5"
                      )}
                    >
                      <td className="py-2 px-3 font-mono text-xs">{key}</td>
                      <td className="py-2 px-3 text-muted-foreground break-all max-w-[180px]">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </td>
                      <td className="py-2 px-3">
                        {isChanged && (
                          <span
                            className="rounded px-1 py-0.5 text-[10px] bg-amber/20 text-amber"
                            title={`Was: ${typeof prevVal === "object" ? JSON.stringify(prevVal) : String(prevVal)}`}
                          >
                            Δ
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
