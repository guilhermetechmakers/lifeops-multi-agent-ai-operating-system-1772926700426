/**
 * RevertConsole — preview before/after diffs, allowed actions, required approvals, confirmation step.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RevertPrepareResponse } from "@/types/audit";

export interface RevertConsoleProps {
  /** Result of revert-prepare; when null, show empty or loading state */
  preview: RevertPrepareResponse | null;
  isLoading?: boolean;
  /** Current rationale input */
  rationale: string;
  onRationaleChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
  confirmLabel?: string;
  className?: string;
}

export function RevertConsole({
  preview,
  isLoading = false,
  rationale,
  onRationaleChange,
  onConfirm,
  onCancel,
  isExecuting = false,
  confirmLabel = "Confirm revert",
  className,
}: RevertConsoleProps) {
  const canRevert = preview?.canRevert === true;
  const requiredApprovals = preview?.requiredApprovals ?? [];
  const hasApprovals = requiredApprovals.length > 0;
  const previewDiffs = preview?.preview;

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.06] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <RotateCcw className="h-4 w-4 text-muted-foreground" aria-hidden />
            Revert preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-white/[0.06] bg-secondary/20 text-sm text-muted-foreground">
            Validating revert…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (preview == null) {
    return (
      <Card className={cn("border-white/[0.06] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <RotateCcw className="h-4 w-4 text-muted-foreground" aria-hidden />
            Revert console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select an event and run revert-prepare to see a preview and confirm.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.06] bg-card transition-shadow duration-200", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <RotateCcw className="h-4 w-4 text-muted-foreground" aria-hidden />
          Revert preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review the diff below. Revert is applied only after you confirm.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canRevert && preview.reason != null && (
          <div className="flex items-start gap-2 rounded-lg border border-amber/50 bg-amber/10 px-3 py-2 text-sm text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber" aria-hidden />
            <span>{preview.reason}</span>
          </div>
        )}

        {previewDiffs != null && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Diff preview
            </p>
            <ScrollArea className="h-40 rounded-lg border border-white/[0.06] bg-secondary/20 p-3 font-mono text-xs">
              {previewDiffs.beforeState != null && Object.keys(previewDiffs.beforeState).length > 0 && (
                <div className="mb-2">
                  <span className="text-muted-foreground">Before: </span>
                  <pre className="mt-0.5 whitespace-pre-wrap break-all text-foreground">
                    {JSON.stringify(previewDiffs.beforeState, null, 2)}
                  </pre>
                </div>
              )}
              {previewDiffs.afterState != null && Object.keys(previewDiffs.afterState).length > 0 && (
                <div>
                  <span className="text-muted-foreground">After (reverted): </span>
                  <pre className="mt-0.5 whitespace-pre-wrap break-all text-foreground">
                    {JSON.stringify(previewDiffs.afterState, null, 2)}
                  </pre>
                </div>
              )}
              {previewDiffs.diffs != null && Object.keys(previewDiffs.diffs).length > 0 && (
                <div className="mt-2 border-t border-white/[0.06] pt-2">
                  <span className="text-muted-foreground">Changes: </span>
                  <pre className="mt-0.5 whitespace-pre-wrap break-all text-foreground">
                    {JSON.stringify(previewDiffs.diffs, null, 2)}
                  </pre>
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {hasApprovals && (
          <div className="rounded-lg border border-amber/30 bg-amber/5 px-3 py-2 text-sm text-foreground">
            <p className="font-medium">Required approvals</p>
            <ul className="mt-1 list-inside list-disc text-muted-foreground">
              {requiredApprovals.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="revert-console-rationale">Reason (required for audit)</Label>
          <Input
            id="revert-console-rationale"
            value={rationale}
            onChange={(e) => onRationaleChange(e.target.value)}
            placeholder="e.g. Incorrect configuration applied"
            className="bg-background"
            disabled={isExecuting}
            aria-required="true"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isExecuting}
            aria-label="Cancel revert"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={onConfirm}
            disabled={!canRevert || isExecuting || !rationale.trim()}
            aria-label={confirmLabel}
          >
            <RotateCcw className="h-4 w-4" />
            {isExecuting ? "Reverting…" : confirmLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
