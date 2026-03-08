/**
 * Conflict Resolution page — CRE configuration, rule DSL, conflict list.
 * Full Conflict Resolution Engine experience with resolve, override, inspect.
 */

import { useCallback, useState } from "react";
import { AnimatedPage } from "@/components/animated-page";
import {
  CREnginePanel,
  RuleDSLEditor,
  ConflictList,
  OverrideConflictModal,
} from "@/components/conflict-resolution";
import {
  useConflicts,
  useResolveConflicts,
  useOverrideConflict,
  useLastResolutions,
} from "@/hooks/use-conflicts";
import type { Conflict, RuleDraft } from "@/types/conflicts";

const DEFAULT_RULE: RuleDraft = {
  id: "rule-1",
  name: "Higher priority wins",
  priority: 100,
  condition: "agent.priority > other.priority",
  actions: [{ type: "defer", payload: { to: "higher_priority" } }],
};

export default function ConflictResolutionPage() {
  const { items: conflicts } = useConflicts();
  const lastResolutions = useLastResolutions();
  const resolveMutation = useResolveConflicts();
  const [overrideConflictId, setOverrideConflictId] = useState<string | null>(null);
  const overrideMutation = useOverrideConflict();
  const [rule, setRule] = useState<RuleDraft>(DEFAULT_RULE);

  const openConflicts = (conflicts ?? []).filter((c) => c.status === "open");
  const conflictInputs = openConflicts.map((c) => ({
    id: c.id,
    agents: c.agents ?? [],
    context: c.context ?? undefined,
  }));

  const handleResolveAll = useCallback(() => {
    if (conflictInputs.length === 0) return;
    resolveMutation.mutate({
      conflicts: conflictInputs,
      rules: [rule],
    });
  }, [conflictInputs, rule, resolveMutation]);

  const handleResolve = useCallback(
    (conflict: Conflict) => {
      resolveMutation.mutate({
        conflicts: [
          {
            id: conflict.id,
            agents: conflict.agents ?? [],
            context: conflict.context ?? undefined,
          },
        ],
        rules: [rule],
      });
    },
    [rule, resolveMutation]
  );

  const handleOverride = useCallback((conflict: Conflict) => {
    setOverrideConflictId(conflict.id);
  }, []);

  const handleOverrideSubmit = useCallback(
    (payload: { outcome: string; notes: string }) => {
      if (!overrideConflictId) return;
      overrideMutation.mutate({ id: overrideConflictId, payload });
      setOverrideConflictId(null);
    },
    [overrideConflictId, overrideMutation]
  );

  const overrideConflict = overrideConflictId
    ? (conflicts ?? []).find((c) => c.id === overrideConflictId) ?? null
    : null;

  return (
    <AnimatedPage className="space-y-6 animate-fade-in-up">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          Conflict Resolution Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Define rules, resolve conflicts, and audit decisions with full explainability
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CREnginePanel
            conflicts={conflicts ?? []}
            resolutions={lastResolutions}
            isResolving={resolveMutation.isPending}
            onResolve={handleResolveAll}
          />
          <ConflictList
            conflicts={conflicts ?? []}
            onResolve={handleResolve}
            onOverride={handleOverride}
            onResolveAll={handleResolveAll}
            isResolving={resolveMutation.isPending}
          />
        </div>
        <div className="space-y-6">
          <RuleDSLEditor
            rule={rule}
            onChange={setRule}
            onValidate={(cond) => {
              if (!cond?.trim()) return "Condition is required";
              return null;
            }}
          />
        </div>
      </div>

      <OverrideConflictModal
        open={overrideConflictId != null}
        onOpenChange={(open) => !open && setOverrideConflictId(null)}
        conflict={overrideConflict}
        onSubmit={handleOverrideSubmit}
        isSubmitting={overrideMutation.isPending}
      />
    </AnimatedPage>
  );
}
