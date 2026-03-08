/**
 * useTrainingMealPlanner — Central state for Training & Meal Planner.
 * Single source of truth for plan, schedule, suggestions; guards all arrays.
 */

import { useState, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generatePlan,
  syncPlanCalendar,
  aggregateGrocery,
  adjustPlan,
  agentSuggest,
} from "@/api/training-meals";
import type {
  Plan,
  PlanConstraints,
  ScheduleItem,
  PlanGroceryItem,
  AgentSuggestion,
  Adjustment,
  GeneratePlanPayload,
} from "@/types/training-meals";

const PLAN_STORAGE_KEY = "lifeops-training-meal-plan";

function loadStoredPlan(): Plan | null {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Plan;
    if (parsed && typeof parsed === "object" && parsed.id) return parsed;
  } catch {
    /**/
  }
  return null;
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

export interface UseTrainingMealPlannerOptions {
  userId?: string;
}

export function useTrainingMealPlanner(options: UseTrainingMealPlannerOptions = {}) {
  const userId = options?.userId ?? "u1";
  const [plan, setPlan] = useState<Plan | null>(() => loadStoredPlan());
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [pendingAdjustments, setPendingAdjustments] = useState<Adjustment[]>([]);
  const queryClient = useQueryClient();

  const schedule = useMemo(() => {
    const p = plan ?? null;
    const list = p?.schedule ?? [];
    return Array.isArray(list) ? list : [];
  }, [plan]);

  const meals = useMemo(() => {
    const p = plan ?? null;
    const list = p?.meals ?? [];
    return Array.isArray(list) ? list : [];
  }, [plan]);

  const workouts = useMemo(() => {
    const p = plan ?? null;
    const list = p?.workouts ?? [];
    return Array.isArray(list) ? list : [];
  }, [plan]);

  const groceryList = useMemo(() => {
    const p = plan ?? null;
    const list = p?.groceryList ?? [];
    return Array.isArray(list) ? list : [];
  }, [plan]);

  const dailyTotals = useMemo(() => {
    const totals = plan?.nutritionTotals?.daily ?? [];
    return Array.isArray(totals) ? totals : [];
  }, [plan]);

  const weeklyTotals = useMemo(() => {
    const totals = plan?.nutritionTotals?.weekly ?? [];
    return Array.isArray(totals) ? totals : [];
  }, [plan]);

  const generateMutation = useMutation({
    mutationFn: (payload: Omit<GeneratePlanPayload, "userId">) =>
      generatePlan({ ...payload, userId }),
    onSuccess: (data) => {
      if (data) {
        setPlan(data);
        savePlan(data);
        toast.success("Plan generated");
      }
    },
    onError: () => {
      toast.error("Failed to generate plan");
    },
  });

  const syncCalendarMutation = useMutation({
    mutationFn: (planId: string) => syncPlanCalendar({ planId }),
    onSuccess: (result) => {
      if (result?.success) {
        toast.success("Calendar synced");
        queryClient.invalidateQueries({ queryKey: ["health", "training"] });
      }
    },
    onError: () => {
      toast.error("Failed to sync calendar");
    },
  });

  const adjustMutation = useMutation({
    mutationFn: (payload: { planId: string; adjustments: Adjustment[] }) =>
      adjustPlan(payload),
    onSuccess: (updated) => {
      if (updated) {
        setPlan(updated);
        savePlan(updated);
      }
      setPendingAdjustments([]);
      toast.success(updated ? "Plan updated" : "Adjustment applied");
    },
    onError: () => {
      toast.error("Failed to apply adjustments");
    },
  });

  const suggestMutation = useMutation({
    mutationFn: (planId: string) => agentSuggest({ planId }),
    onSuccess: (result) => {
      const list = result?.suggestions ?? [];
      setSuggestions(Array.isArray(list) ? list : []);
      if (list.length > 0) toast.success("Suggestions loaded");
    },
    onError: () => {
      toast.error("Failed to load suggestions");
    },
  });

  const generatePlanAction = useCallback(
    (goals: string[], durationWeeks: number, constraints: PlanConstraints) => {
      generateMutation.mutate({ goals, durationWeeks, constraints });
    },
    [generateMutation]
  );

  const syncCalendar = useCallback(() => {
    const p = plan ?? null;
    if (!p?.id) {
      toast.error("No plan to sync");
      return;
    }
    syncCalendarMutation.mutate(p.id);
  }, [plan, syncCalendarMutation]);

  const requestGroceryAggregate = useCallback(async (): Promise<PlanGroceryItem[]> => {
    const p = plan ?? null;
    if (!p?.id) return [];
    const result = await aggregateGrocery(p.id);
    const items = result?.items ?? [];
    const list = Array.isArray(items) ? items : [];
    if (list.length > 0 && p) {
      setPlan({ ...p, groceryList: list });
      savePlan({ ...p, groceryList: list });
    }
    return list;
  }, [plan]);

  const applyAdjustments = useCallback(
    (adjustments: Adjustment[], suggestionId?: string) => {
      const p = plan ?? null;
      if (!p?.id) return;
      const safe = Array.isArray(adjustments) ? adjustments : [];
      if (safe.length === 0) return;
      adjustMutation.mutate(
        { planId: p.id, adjustments: safe },
        {
          onSuccess: () => {
            if (suggestionId) {
              setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
            }
          },
        }
      );
    },
    [plan, adjustMutation]
  );

  const fetchSuggestions = useCallback(() => {
    const p = plan ?? null;
    if (!p?.id) {
      toast.error("Generate a plan first");
      return;
    }
    suggestMutation.mutate(p.id);
  }, [plan, suggestMutation]);

  const rejectSuggestion = useCallback((suggestionId: string) => {
    setSuggestions((prev) => (prev ?? []).filter((s) => s.id !== suggestionId));
  }, []);

  const updateSchedule = useCallback((newSchedule: ScheduleItem[]) => {
    const p = plan ?? null;
    if (!p) return;
    const updated = { ...p, schedule: Array.isArray(newSchedule) ? newSchedule : [] };
    setPlan(updated);
    savePlan(updated);
  }, [plan]);

  const setGroceryChecked = useCallback(
    (itemId: string, checked: boolean) => {
      const p = plan ?? null;
      if (!p) return;
      const list = (p.groceryList ?? []).map((item) =>
        item.id === itemId ? { ...item, checked } : item
      );
      const updated = { ...p, groceryList: list };
      setPlan(updated);
      savePlan(updated);
    },
    [plan]
  );

  return {
    plan,
    schedule,
    meals,
    workouts,
    groceryList,
    dailyTotals,
    weeklyTotals,
    suggestions,
    pendingAdjustments,
    setPendingAdjustments,
    generatePlanAction,
    syncCalendar,
    requestGroceryAggregate,
    applyAdjustments,
    fetchSuggestions,
    updateSchedule,
    setGroceryChecked,
    isGenerating: generateMutation.isPending,
    isSyncing: syncCalendarMutation.isPending,
    isAdjusting: adjustMutation.isPending,
    isSuggesting: suggestMutation.isPending,
    rejectSuggestion,
  };
}
