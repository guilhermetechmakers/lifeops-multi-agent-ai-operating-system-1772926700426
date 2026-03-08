/**
 * Run Details page — comprehensive view of a single cron/agent run.
 * Inputs, trace, logs, diffs, artifacts, timing, outcome, reversibility, audit trail.
 * LifeOps design system; runtime-safe array handling.
 */

import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { useRunDetails, useRevertRun } from "@/hooks/use-run-details";
import {
  RunDetailsHeader,
  InputsPanel,
  MessageTraceViewer,
  LogsEventsPanel,
  RunDetailsDiffsViewer,
  ArtifactsPanel,
  TimingPane,
  ReversibilityPanel,
  AuditTrailPanel,
  RelatedContextPanel,
} from "@/components/run-details";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function RunDetailsPage() {
  const { id: cronjobId, runId } = useParams<{ id?: string; runId: string }>();
  const { run, trace, logs, diffs, artifacts, timing, reversibleActions, auditTrail, isLoading, error } =
    useRunDetails(runId ?? null, cronjobId);
  const revertMutation = useRevertRun(runId ?? null);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);

  const canRevert =
    Boolean(run) &&
    (run?.status === "succeeded" || run?.status === "failed") &&
    Array.isArray(reversibleActions) &&
    reversibleActions.length > 0 &&
    reversibleActions.every(
      (a: { status?: string }) => a.status === "passed" || a.status === "approved"
    );

  const revertDisabledReason = !canRevert
    ? run?.status === "running"
      ? "Run is still in progress"
      : (reversibleActions ?? []).length === 0
        ? "No reversible actions"
        : "Validators not passed"
    : undefined;

  const handleRevert = useCallback(() => {
    setRevertDialogOpen(true);
  }, []);

  const handleConfirmRevert = useCallback(
    (reason: string) => {
      revertMutation.mutate({
        reason: reason || "User-initiated revert",
        confirmations: [],
      });
      setRevertDialogOpen(false);
    },
    [revertMutation]
  );

  const handleReRun = useCallback(() => {
    toast.info("Re-run functionality requires integration with Cronjobs API");
  }, []);

  const handleExportArtifacts = useCallback(() => {
    const list = artifacts ?? [];
    if (list.length === 0) {
      toast.info("No artifacts to export");
      return;
    }
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `run-${runId}-artifacts.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Artifacts exported");
  }, [artifacts, runId]);

  if (error) {
    return (
      <AnimatedPage>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      </AnimatedPage>
    );
  }

  if (isLoading || !runId) {
    return (
      <AnimatedPage>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </AnimatedPage>
    );
  }

  if (!run) {
    return (
      <AnimatedPage>
        <div className="rounded-lg border border-white/[0.06] bg-secondary/20 p-4 text-center text-muted-foreground">
          Run not found.
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <RunDetailsHeader
        run={run}
        canRevert={canRevert}
        revertDisabledReason={revertDisabledReason}
        onRevert={handleRevert}
        onReRun={handleReRun}
        onExportArtifacts={handleExportArtifacts}
        isReverting={revertMutation.isPending}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <InputsPanel
          inputs={run.inputs}
          effectiveInputs={run.effectiveInputs}
          scope={run.scope}
          permissions={run.permissions}
        />
        <RelatedContextPanel run={run} />
      </div>

      <MessageTraceViewer trace={trace} />

      <div className="grid gap-4 lg:grid-cols-2">
        <LogsEventsPanel logs={logs} />
        <RunDetailsDiffsViewer diffs={diffs} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ArtifactsPanel artifacts={artifacts} />
        <TimingPane timing={timing} durationMs={run.durationMs} />
      </div>

      <ReversibilityPanel
        reversibleActions={reversibleActions}
        canRevert={canRevert}
        revertDisabledReason={revertDisabledReason}
        onConfirmRevert={handleConfirmRevert}
        isReverting={revertMutation.isPending}
        revertDialogOpen={revertDialogOpen}
        onRevertDialogOpenChange={setRevertDialogOpen}
      />

      <AuditTrailPanel auditTrail={auditTrail} />
    </AnimatedPage>
  );
}
