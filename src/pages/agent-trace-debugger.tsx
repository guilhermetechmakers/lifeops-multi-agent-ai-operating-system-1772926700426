/**
 * Agent Trace & Debugger — debugging and observability for multi-agent workflows.
 * Conversation graph, scoped memory inspector, step-through controls, assertions, export.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AgentGraphView,
  ScopedMemoryInspector,
  StepThroughController,
  AssertionsPanel,
  RunTraceExporter,
  RunDetailsPanel,
} from "@/components/agent-trace";
import {
  useTrace,
  useDebugRuns,
  useRevertTrace,
  useExportTrace,
} from "@/hooks/use-agent-trace";
import { mockAssertions, mockConflicts } from "@/api/debug-trace-mock";
import { cn } from "@/lib/utils";

const RUN_PARAM = "runId";
const CRON_PARAM = "cronJobId";

export default function AgentTraceDebuggerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const runId = searchParams.get(RUN_PARAM) ?? null;
  const cronJobId = searchParams.get(CRON_PARAM) ?? null;

  const { runs } = useDebugRuns(cronJobId ?? "cron-1");

  const {
    data: traceData,
    agents,
    messages,
    steps,
    memory,
    isLoading,
    isError,
  } = useTrace(runId);

  const revertMutation = useRevertTrace(runId);
  const exportMutation = useExportTrace(runId);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedScopeId, setSelectedScopeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const safeSteps = steps ?? [];
  const activeStepAgentId = useMemo(() => {
    const step = safeSteps[currentStepIndex];
    return step?.activeAgentId ?? null;
  }, [safeSteps, currentStepIndex]);

  useEffect(() => {
    if (!runId || safeSteps.length === 0) return;
    setCurrentStepIndex(0);
  }, [runId, safeSteps.length]);

  useEffect(() => {
    if (!isPlaying || safeSteps.length === 0) return;
    const step = currentStepIndex;
    if (step >= safeSteps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const t = setTimeout(() => setCurrentStepIndex((i) => Math.min(i + 1, safeSteps.length - 1)), 800);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIndex, safeSteps.length]);

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);

  const scopes = memory?.scopes ?? [];
  const entries = memory?.entries ?? [];
  const initialScopeId = scopes[0]?.id ?? null;
  const scopeId = selectedScopeId ?? initialScopeId;

  const assertions = useMemo(() => mockAssertions, []);
  const conflicts = useMemo(() => mockConflicts, []);

  const handleExport = useCallback(
    (options: { format: "json" | "zip"; scope: string; runIds?: string[] }) => {
      exportMutation.mutate({
        format: options.format,
        scope: options.scope as "single" | "aggregate" | "workspace",
        runIds: options.runIds,
      });
    },
    [exportMutation]
  );

  const handleRevert = useCallback(() => {
    revertMutation.mutate({ reason: "User-initiated from Agent Trace & Debugger" });
  }, [revertMutation]);

  if (isError) {
    return (
      <AnimatedPage>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
          Failed to load trace. Select a run from the list or check the run ID.
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="animate-fade-in-up">
      <div className="space-y-4">
        <header>
          <h1 className="text-xl font-semibold text-foreground">Agent Trace &amp; Debugger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inspect agent conversations, scoped memory, and conflict resolution
          </p>
        </header>

        {/* Run overview: list recent runs to select */}
        <div className="rounded-lg border border-white/[0.03] bg-card p-4">
          <h2 className="text-sm font-medium text-foreground mb-2">Recent runs</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add <code className="bg-secondary px-1 rounded">?runId=run-1</code> to the URL, or open a run from Cronjobs.
            </p>
          ) : (
            <ul className="space-y-2" role="list">
              {(runs ?? []).map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set(RUN_PARAM, r.id);
                        if (r.cronJobId) next.set(CRON_PARAM, r.cronJobId);
                        return next;
                      })
                    }
                    className={cn(
                      "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                      r.id === runId
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-white/[0.03] bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span className="font-medium">{r.id}</span>
                    <span className="ml-2 text-xs">{r.status}</span>
                    <span className="ml-2 text-xs opacity-80">{r.startedAt ? new Date(r.startedAt).toLocaleString() : ""}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {runId && (
          <>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-[320px] rounded-lg" />
                <Skeleton className="h-[320px] rounded-lg" />
                <Skeleton className="h-[320px] rounded-lg" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-4">
                    <AgentGraphView
                      agents={agents}
                      messages={messages}
                      selectedAgentId={selectedAgentId}
                      activeStepAgentId={activeStepAgentId}
                      onSelectAgent={setSelectedAgentId}
                      className="min-h-[320px]"
                    />
                    <StepThroughController
                      steps={safeSteps}
                      currentStepIndex={currentStepIndex}
                      onStepChange={setCurrentStepIndex}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                    />
                  </div>
                  <div className="space-y-4">
                    <ScopedMemoryInspector
                      scopes={scopes}
                      entries={entries}
                      selectedScopeId={scopeId}
                      onScopeChange={setSelectedScopeId}
                    />
                    <RunDetailsPanel
                      runId={runId}
                      cronJobId={cronJobId}
                      status={traceData?.runId ? "succeeded" : undefined}
                      messageCount={messages.length}
                      artifactCount={traceData?.artifacts?.length ?? 0}
                      onRevert={handleRevert}
                      isReverting={revertMutation.isPending}
                    />
                    <RunTraceExporter
                      runId={runId}
                      onExport={handleExport}
                      isExporting={exportMutation.isPending}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <AssertionsPanel
                    assertions={assertions}
                    conflicts={conflicts}
                    runId={runId}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  );
}
