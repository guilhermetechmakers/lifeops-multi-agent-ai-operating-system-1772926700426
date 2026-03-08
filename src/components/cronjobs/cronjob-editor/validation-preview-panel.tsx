/**
 * ValidationPreviewPanel: Dry-run validation, estimated cost, resource usage.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Loader2, Play } from "lucide-react";

export interface DryRunResult {
  valid: boolean;
  estimatedCost?: number;
  estimatedDurationMs?: number;
  conflicts?: string[];
  errors?: string[];
  nextRunPreview?: string;
}

interface ValidationPreviewPanelProps {
  onDryRun: () => Promise<DryRunResult>;
  lastResult?: DryRunResult | null;
  isValidating?: boolean;
  className?: string;
}

export function ValidationPreviewPanel({
  onDryRun,
  lastResult,
  isValidating = false,
  className,
}: ValidationPreviewPanelProps) {
  const [loading, setLoading] = useState(false);
  const isRunning = loading || isValidating;

  const handleDryRun = async () => {
    setLoading(true);
    try {
      await onDryRun();
    } finally {
      setLoading(false);
    }
  };

  const result = lastResult;
  const hasErrors = (result?.errors ?? []).length > 0;
  const hasConflicts = (result?.conflicts ?? []).length > 0;
  const valid = result?.valid ?? false;

  return (
    <div className={cn("space-y-4", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={handleDryRun}
        disabled={isRunning}
        className="gap-2"
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        Run dry-run validation
      </Button>

      {result && (
        <div
          className={cn(
            "rounded-lg border p-4",
            valid && !hasErrors && !hasConflicts
              ? "border-teal/30 bg-teal/5"
              : "border-destructive/30 bg-destructive/5"
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            {valid && !hasErrors && !hasConflicts ? (
              <CheckCircle2 className="h-5 w-5 text-teal" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            <span className="font-medium text-sm">
              {valid && !hasErrors && !hasConflicts
                ? "Validation passed"
                : "Validation issues found"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            {result.estimatedCost != null && (
              <p className="text-muted-foreground">
                Estimated cost: ${result.estimatedCost.toFixed(2)}
              </p>
            )}
            {result.estimatedDurationMs != null && (
              <p className="text-muted-foreground">
                Estimated duration: {(result.estimatedDurationMs / 1000).toFixed(1)}s
              </p>
            )}
            {result.nextRunPreview && (
              <p className="text-muted-foreground">
                Next run: {result.nextRunPreview}
              </p>
            )}
            {(result.errors ?? []).length > 0 && (
              <ul className="list-disc list-inside text-destructive">
                {(result.errors ?? []).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
            {(result.conflicts ?? []).length > 0 && (
              <ul className="list-disc list-inside text-amber">
                {(result.conflicts ?? []).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
