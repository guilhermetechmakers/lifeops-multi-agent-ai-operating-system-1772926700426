/**
 * Run Details page — comprehensive view of a single cron/agent run.
 * Tabbed sections: Inputs, Trace, Logs, Diffs, Artifacts, Timing, Outcome, Revert Actions.
 * LifeOps design system; runtime-safe array handling.
 */

import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRunDetails,
  useRevertRun,
  usePauseRun,
  useResumeRun,
  useHaltRun,
  useInjectInput,
} from "@/hooks/use-run-details";
import { useMemoryDiffs } from "@/hooks/use-memory-diffs";
import {
  RunDetailsHeader,
  InputsPanel,
  MessageTraceViewer,
  MessageTraceGraph,
  LogsEventsPanel,
  RunDetailsDiffsViewer,
  MemoryDiffPanel,
  ArtifactsPanel,
  TimingPane,
  ReversibilityPanel,
  RevertModal,
  AuditTrailPanel,
  RelatedContextPanel,
  RunOverviewPanel,
  HumanInputInjectModal,
  ApprovalQueue,
} from "@/components/run-details";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  FileInput,
  GitBranch,
  FileText,
  Diff,
  Paperclip,
  Clock,
  CheckCircle2,
  RotateCcw,
  History,
  CheckSquare,
  Database,
} from "lucide-react";

export default function RunDetailsPage() {
  const { id: cronjobId, runId } = useParams<{ id?: string; runId: string }>();
  const navigate = useNavigate();
  const { run, trace, logs, diffs, artifacts, timing, reversibleActions, auditTrail, isLoading, error } =
    useRunDetails(runId ?? null, cronjobId);
  const { diffs: memoryDiffs } = useMemoryDiffs(runId ?? null);
  const revertMutation = useRevertRun(runId ?? null);
  const pauseMutation = usePauseRun(runId ?? null);
  const resumeMutation = useResumeRun(runId ?? null);
  const haltMutation = useHaltRun(runId ?? null);
  const injectMutation = useInjectInput(runId ?? null);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [revertReason, setRevertReason] = useState("");
  const [injectModalOpen, setInjectModalOpen] = useState(false);
  const [traceViewMode, setTraceViewMode] = useState<"timeline" | "graph">("timeline");

  const mockApprovals: import("@/components/run-details/approval-queue").ApprovalItem[] =
    (run?.status === "paused" || run?.status === "running") && run
      ? (run.pendingApprovals ?? []).length > 0
        ? (run.pendingApprovals ?? []) as import("@/components/run-details/approval-queue").ApprovalItem[]
        : [
            {
              id: "approval-1",
              actionType: "human-review",
              agentId: "agent-pr-triage",
              context: { prCount: 3, threshold: 5 },
              requestedAt: run.startedAt,
            },
          ]
      : [];

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
      setRevertReason("");
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

  const handleExportDebug = useCallback(() => {
    const payload = {
      run,
      trace,
      logs,
      diffs,
      artifacts,
      timing,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `run-${runId}-debug.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Debug trace exported");
  }, [run, trace, logs, diffs, artifacts, timing, runId]);

  const handleOpenDebugger = useCallback(() => {
    const params = new URLSearchParams();
    params.set("runId", runId ?? "");
    if (cronjobId) params.set("cronJobId", cronjobId);
    navigate(`/dashboard/debug?${params.toString()}`);
  }, [runId, cronjobId, navigate]);

  const handleInjectInput = useCallback(
    (payload: { stepId?: string; agentId?: string; input: Record<string, unknown>; reason?: string }) => {
      injectMutation.mutate(payload);
    },
    [injectMutation]
  );

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
        onExportDebug={handleExportDebug}
        onOpenDebugger={handleOpenDebugger}
        onPause={() => pauseMutation.mutate()}
        onResume={() => resumeMutation.mutate()}
        onHalt={() => haltMutation.mutate()}
        onInjectInput={() => setInjectModalOpen(true)}
        isReverting={revertMutation.isPending}
        isPausing={pauseMutation.isPending}
        isResuming={resumeMutation.isPending}
        isHalting={haltMutation.isPending}
        isInjecting={injectMutation.isPending}
      />

      <HumanInputInjectModal
        open={injectModalOpen}
        onOpenChange={setInjectModalOpen}
        onSubmit={handleInjectInput}
        isSubmitting={injectMutation.isPending}
        runId={run.id}
      />

      <Tabs defaultValue="inputs" className="space-y-4">
        <TabsList className="bg-secondary border border-white/[0.03] flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="inputs" className="gap-2">
            <FileInput className="h-4 w-4" />
            Inputs
          </TabsTrigger>
          <TabsTrigger value="trace" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Trace
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="diffs" className="gap-2">
            <Diff className="h-4 w-4" />
            Diffs
          </TabsTrigger>
          <TabsTrigger value="memory" className="gap-2">
            <Database className="h-4 w-4" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="artifacts" className="gap-2">
            <Paperclip className="h-4 w-4" />
            Artifacts
          </TabsTrigger>
          <TabsTrigger value="timing" className="gap-2">
            <Clock className="h-4 w-4" />
            Timing
          </TabsTrigger>
          <TabsTrigger value="outcome" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Outcome
          </TabsTrigger>
          <TabsTrigger value="revert" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Revert
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            Audit
          </TabsTrigger>
          {(run?.status === "paused" || run?.status === "running") && (
            <TabsTrigger value="approvals" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Approvals
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="inputs" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <InputsPanel
                inputs={run.inputs}
                effectiveInputs={run.effectiveInputs}
                scope={run.scope}
                permissions={run.permissions}
              />
              <RelatedContextPanel run={run} />
            </div>
            <RunOverviewPanel run={run} />
          </div>
        </TabsContent>

        <TabsContent value="trace" className="space-y-4">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setTraceViewMode("timeline")}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                traceViewMode === "timeline"
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-white/[0.03] bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setTraceViewMode("graph")}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                traceViewMode === "graph"
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-white/[0.03] bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              Graph
            </button>
          </div>
          {traceViewMode === "timeline" ? (
            <MessageTraceViewer trace={trace} />
          ) : (
            <MessageTraceGraph trace={trace} />
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <LogsEventsPanel logs={logs} />
        </TabsContent>

        <TabsContent value="diffs" className="space-y-4">
          <RunDetailsDiffsViewer diffs={diffs} />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <MemoryDiffPanel diffs={memoryDiffs} runId={runId ?? undefined} />
        </TabsContent>

        <TabsContent value="artifacts" className="space-y-4">
          <ArtifactsPanel artifacts={artifacts} />
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <TimingPane timing={timing} durationMs={run.durationMs} />
        </TabsContent>

        <TabsContent value="outcome" className="space-y-4">
          <div className="rounded-lg border border-white/[0.03] bg-card p-4">
            <h3 className="text-base font-medium text-foreground mb-2">Outcome</h3>
            <p className="text-sm text-muted-foreground">
              Status: {run.status}
              {run.outcome?.summary != null && ` — ${run.outcome.summary}`}
            </p>
            {run.outcome?.details != null && (
              <pre className="mt-2 rounded-md bg-secondary/50 p-3 text-xs font-mono text-foreground overflow-x-auto">
                {run.outcome.details}
              </pre>
            )}
          </div>
        </TabsContent>

        <TabsContent value="revert" className="space-y-4">
          <ReversibilityPanel
            reversibleActions={reversibleActions}
            canRevert={canRevert}
            revertDisabledReason={revertDisabledReason}
            onConfirmRevert={handleConfirmRevert}
            isReverting={revertMutation.isPending}
            revertDialogOpen={revertDialogOpen}
            onRevertDialogOpenChange={setRevertDialogOpen}
          />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditTrailPanel auditTrail={auditTrail} />
        </TabsContent>

        {(run?.status === "paused" || run?.status === "running") && (
          <TabsContent value="approvals" className="space-y-4">
            <ApprovalQueue
              items={Array.isArray(mockApprovals) ? mockApprovals : []}
              onApprove={(id) => toast.success(`Approved ${id}`)}
              onReject={(id) => toast.info(`Rejected ${id}`)}
            />
          </TabsContent>
        )}
      </Tabs>
    </AnimatedPage>
  );
}
