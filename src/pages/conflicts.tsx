/**
 * Conflict Resolution Engine page — CRE panel, Rule DSL editor, Conflict list.
 * Resolve conflicts with deterministic rules; human-in-the-loop overrides.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CREnginePanel,
  RuleDSLEditor,
  ConflictList,
} from "@/components/conflict-resolution";
import { useResolveConflicts, useOverrideConflict } from "@/hooks/use-conflicts";
import { toast } from "sonner";
import { Cpu, Code2, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conflict, RuleDraft } from "@/types/conflicts";
import { safeArray } from "@/lib/api";

const MOCK_CONFLICTS: Conflict[] = [
  {
    id: "conflict-1",
    agents: [
      { id: "agent-pr-triage", role: "pr-triage", priority: 10 },
      { id: "agent-notifier", role: "notifier", priority: 5 },
      { id: "agent-reviewer", role: "reviewer", priority: 8 },
    ],
    context: { resource: "pr-status-123", competingActions: ["approve", "reject"] },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: "open",
  },
  {
    id: "conflict-2",
    agents: [
      { id: "agent-pr-triage", role: "pr-triage", priority: 10 },
      { id: "agent-notifier", role: "notifier", priority: 5 },
    ],
    context: { resource: "slack-channel", competingActions: ["notify", "silence"] },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    status: "resolved",
  },
];

const MOCK_RULES: RuleDraft[] = [
  {
    id: "rule-1",
    name: "Higher priority wins",
    priority: 100,
    condition: "agent.priority > other.priority",
    actions: [{ type: "defer", payload: { to: "higher_priority" } }],
  },
  {
    id: "rule-2",
    name: "First-come-first-served",
    priority: 50,
    condition: "timestamp < other.timestamp",
    actions: [{ type: "accept", payload: {} }],
  },
];

export default function ConflictsPage() {
  const navigate = useNavigate();
  const resolveMutation = useResolveConflicts();
  const overrideMutation = useOverrideConflict();

  const [conflicts, setConflicts] = useState<Conflict[]>(MOCK_CONFLICTS);
  const [rules, setRules] = useState<RuleDraft[]>(MOCK_RULES);
  const [engineStatus, setEngineStatus] = useState<"idle" | "resolving" | "ready">("idle");

  const openConflicts = safeArray(conflicts).filter((c) => c.status === "open");
  const recentResolved = safeArray(conflicts).filter((c) => c.status === "resolved").length;

  const handleResolve = useCallback(() => {
    const toResolve = openConflicts.map((c) => ({
      id: c.id,
      agents: c.agents ?? [],
      context: c.context ?? null,
    }));

    if (toResolve.length === 0) {
      toast.info("No open conflicts to resolve");
      return;
    }

    setEngineStatus("resolving");
    resolveMutation.mutate(
      { conflicts: toResolve, rules },
      {
        onSettled: () => setEngineStatus("idle"),
        onSuccess: (data) => {
          const resolutions = safeArray(data?.resolutions);
          if (resolutions.length > 0) {
            setConflicts((prev) =>
              (prev ?? []).map((c) => {
                const res = resolutions.find((r) => r.conflictId === c.id);
                return res ? { ...c, status: "resolved" as const } : c;
              })
            );
          }
        },
      }
    );
  }, [openConflicts, rules, resolveMutation]);

  const handleOverride = useCallback(
    (id: string) => {
      overrideMutation.mutate(
        { id, payload: { outcome: "overridden", notes: "Manual override" } },
        {
          onSuccess: () => {
            setConflicts((prev) =>
              (prev ?? []).map((c) =>
                c.id === id ? { ...c, status: "overridden" as const } : c
              )
            );
          },
        }
      );
    },
    [overrideMutation]
  );

  const handleInspect = useCallback(
    (id: string) => {
      navigate(`/dashboard/debug?conflictId=${id}`);
    },
    [navigate]
  );

  return (
    <AnimatedPage className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          Conflict Resolution Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Resolve inter-agent conflicts with deterministic, priority-based rules. Full
          explainability and human-in-the-loop overrides.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <CREnginePanel
            status={engineStatus}
            activeConflicts={openConflicts.length}
            recentResolutions={recentResolved}
            lastResolvedAt={
              conflicts.find((c) => c.status === "resolved")?.createdAt
            }
          />

          <Tabs defaultValue="rules" className="space-y-4">
            <TabsList className="bg-secondary border border-white/[0.03] flex gap-1 p-1">
              <TabsTrigger value="rules" className="gap-2">
                <Code2 className="h-4 w-4" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="conflicts" className="gap-2">
                <List className="h-4 w-4" />
                Conflicts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rules" className="space-y-4">
              <RuleDSLEditor
                rules={rules}
                onRulesChange={(r) => setRules(r)}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={resolveMutation.isPending || openConflicts.length === 0}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-all duration-200",
                    "border-primary bg-primary text-primary-foreground",
                    "hover:bg-primary/90 hover:scale-[1.02]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                >
                  {resolveMutation.isPending ? "Resolving…" : "Resolve All Conflicts"}
                </button>
              </div>
            </TabsContent>
            <TabsContent value="conflicts" className="space-y-4">
              <ConflictList
                conflicts={conflicts}
                onResolve={(id) => {
                  const c = conflicts.find((x) => x.id === id);
                  if (c) {
                    resolveMutation.mutate(
                      {
                        conflicts: [
                          {
                            id: c.id,
                            agents: c.agents ?? [],
                            context: c.context ?? null,
                          },
                        ],
                        rules,
                      },
                      {
                        onSuccess: () => {
                          setConflicts((prev) =>
                            (prev ?? []).map((x) =>
                              x.id === id ? { ...x, status: "resolved" as const } : x
                            )
                          );
                        },
                      }
                    );
                  }
                }}
                onOverride={(id) => handleOverride(id)}
                onInspect={handleInspect}
                isResolving={resolveMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-4">
          <ConflictList
            conflicts={conflicts}
            onResolve={(id) => {
              const c = conflicts.find((x) => x.id === id);
              if (c) {
                resolveMutation.mutate(
                  {
                    conflicts: [
                      {
                        id: c.id,
                        agents: c.agents ?? [],
                        context: c.context ?? null,
                      },
                    ],
                    rules,
                  },
                  {
                    onSuccess: () => {
                      setConflicts((prev) =>
                        (prev ?? []).map((x) =>
                          x.id === id ? { ...x, status: "resolved" as const } : x
                        )
                      );
                    },
                  }
                );
              }
            }}
            onOverride={handleOverride}
            onInspect={handleInspect}
            isResolving={resolveMutation.isPending}
          />
        </div>
      </div>
    </AnimatedPage>
  );
}
