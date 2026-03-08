/**
 * useTrainingPlan — Centralized state for Training & Meal Planner.
 * Plan generation, calendar sync, grocery aggregation, agent suggestions.
 */

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generatePlan, syncCalendar, agentSuggest } from "@/api/training-plan";
import type {
  Plan,
  PlanConstraints,
  ScheduleItem,
  Adjustment,
} from "@/types/training-plan";
import { startOfWeek } from "date-fns";

const PLAN_STORAGE_KEY = "lifeops-training-plan";

function loadStoredPlan(): Plan | null {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Plan;
    return parsed && typeof parsed === "object" && "id" in parsed ? parsed : null;
  } catch {
    return null;
  }
}

function savePlan(plan: Plan | null): void {
  try {
    if (plan) {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } else {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    }
  } catch {
    /**/
  }
}

export function useTrainingPlan() {
  const [plan, setPlan] = useState<Plan | null>(loadStoredPlan);
  const [weekStartDate, setWeekStartDate] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [agentSuggestions, setAgentSuggestions] = useState<Adjustment[]>([]);
  const [approvals, setApprovals] = useState<Record<string, "accepted" | "rejected">>({});

  const generateMutation = useMutation({
    mutationFn: (payload: {
      goals: string[];
      durationWeeks: number;
      constraints: PlanConstraints;
    }) =>
      generatePlan({
        userId: "u1",
        ...payload,
      }),
    onSuccess: (data) => {
      const p = data ?? null;
      setPlan(p);
      savePlan(p);
      toast.success("Plan generated");
    },
    onError: () => {
      toast.error("Failed to generate plan");
    },
  });

  const syncMutation = useMutation({
    mutationFn: () =>
      syncCalendar({
        planId: plan?.id ?? "",
        calendarProvider: "local",
      }),
    onSuccess: () => {
      toast.success("Calendar synced");
    },
    onError: () => {
      toast.error("Failed to sync calendar");
    },
  });

  const agentMutation = useMutation({
    mutationFn: () =>
      agentSuggest({
        planId: plan?.id ?? "",
      }),
    onSuccess: (data) => {
      const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
      setAgentSuggestions(suggestions);
      toast.success(suggestions.length > 0 ? "Suggestions loaded" : "No suggestions");
    },
    onError: () => {
      toast.error("Failed to get suggestions");
    },
  });

  const handlePlanGenerated = useCallback(
    (payload: {
      goals: string[];
      durationWeeks: number;
      constraints: PlanConstraints;
    }) => {
      generateMutation.mutate(payload);
    },
    [generateMutation]
  );

  const handleAgentSuggest = useCallback(() => {
    agentMutation.mutate();
  }, [agentMutation]);

  const handleScheduleUpdate = useCallback(
    (schedule: ScheduleItem[]) => {
      if (!plan) return;
      const updated = { ...plan, schedule };
      setPlan(updated);
      savePlan(updated);
    },
    [plan]
  );

  const handleAcceptAdjustment = useCallback((adjustmentId: string) => {
    setApprovals((prev) => ({ ...prev, [adjustmentId]: "accepted" }));
    toast.success("Adjustment accepted");
  }, []);

  const handleRejectAdjustment = useCallback((adjustmentId: string) => {
    setApprovals((prev) => ({ ...prev, [adjustmentId]: "rejected" }));
  }, []);

  const schedule = plan?.schedule ?? [];
  const meals = plan?.meals ?? [];
  const workouts = plan?.workouts ?? [];
  const dailyTotals = plan?.nutritionTotals?.daily ?? [];
  const weeklyTotals = plan?.nutritionTotals?.weekly ?? [];
  const groceryList = plan?.groceryList ?? [];
  const targets = plan?.constraints?.macroTargets ?? undefined;

  return {
    plan,
    schedule,
    meals,
    workouts,
    dailyTotals,
    weeklyTotals,
    groceryList,
    targets,
    weekStartDate,
    setWeekStartDate,
    agentSuggestions,
    approvals,
    isGenerating: generateMutation.isPending,
    isAgentLoading: agentMutation.isPending,
    isSyncing: syncMutation.isPending,
    onPlanGenerated: handlePlanGenerated,
    onAgentSuggest: handleAgentSuggest,
    onScheduleUpdate: handleScheduleUpdate,
    onSyncCalendar: () => syncMutation.mutate(),
    onAcceptAdjustment: handleAcceptAdjustment,
    onRejectAdjustment: handleRejectAdjustment,
  };
}
