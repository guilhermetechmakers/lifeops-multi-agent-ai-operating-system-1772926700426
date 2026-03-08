/**
 * useHealthDashboard — React Query hooks for Health Dashboard data.
 * Centralizes health state, guards against null/undefined.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchHabits,
  fetchTrainingPlans,
  fetchMealPlans,
  fetchRecovery,
  fetchWorkloadRecommendations,
  fetchGroceries,
  fetchHealthSnapshot,
  applyWorkloadAdjustment,
  syncCalendar,
} from "@/api/health";
import type { WorkloadRecommendationItem } from "@/types/health";

export const HEALTH_QUERY_KEYS = {
  habits: ["health", "habits"] as const,
  training: ["health", "training"] as const,
  meals: ["health", "meals"] as const,
  recovery: ["health", "recovery"] as const,
  workload: ["health", "workload"] as const,
  groceries: ["health", "groceries"] as const,
  snapshot: ["health", "snapshot"] as const,
};

export function useHealthHabits() {
  const q = useQuery({
    queryKey: HEALTH_QUERY_KEYS.habits,
    queryFn: fetchHabits,
  });
  return {
    ...q,
    items: q.data ?? [],
  };
}

export function useHealthTrainingPlans() {
  const q = useQuery({
    queryKey: HEALTH_QUERY_KEYS.training,
    queryFn: fetchTrainingPlans,
  });
  return {
    ...q,
    items: q.data ?? [],
  };
}

export function useHealthMealPlans() {
  const q = useQuery({
    queryKey: HEALTH_QUERY_KEYS.meals,
    queryFn: fetchMealPlans,
  });
  return {
    ...q,
    items: q.data ?? [],
  };
}

export function useHealthRecovery() {
  const q = useQuery({
    queryKey: HEALTH_QUERY_KEYS.recovery,
    queryFn: fetchRecovery,
  });
  return {
    ...q,
    items: q.data ?? [],
  };
}

export function useHealthWorkload() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.workload,
    queryFn: fetchWorkloadRecommendations,
  });
}

export function useHealthGroceries() {
  const q = useQuery({
    queryKey: HEALTH_QUERY_KEYS.groceries,
    queryFn: fetchGroceries,
  });
  return {
    ...q,
    items: q.data ?? [],
  };
}

/** Alias for useHealthWorkload — workload recommendations */
export function useHealthWorkloadRecommendations() {
  return useHealthWorkload();
}

/** Mock interventions — no API yet */
export function useHealthInterventions() {
  return useQuery({
    queryKey: ["health", "interventions"],
    queryFn: async () =>
      [] as { id: string; type: string; message?: string; acknowledged?: boolean }[],
  });
}

export function useHealthSnapshot() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.snapshot,
    queryFn: fetchHealthSnapshot,
  });
}

export function useApplyWorkloadAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: applyWorkloadAdjustment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.workload });
      toast.success("Schedule adjustment applied");
    },
    onError: () => {
      toast.error("Failed to apply adjustment");
    },
  });
}

export function useSyncCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: syncCalendar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.training });
      toast.success("Calendar synced");
    },
    onError: () => {
      toast.error("Failed to sync calendar");
    },
  });
}

export interface HealthDashboardData {
  habits: ReturnType<typeof useHealthHabits>["data"];
  trainingPlans: ReturnType<typeof useHealthTrainingPlans>["data"];
  mealPlans: ReturnType<typeof useHealthMealPlans>["data"];
  recovery: ReturnType<typeof useHealthRecovery>["data"];
  workload: ReturnType<typeof useHealthWorkload>["data"];
  groceries: ReturnType<typeof useHealthGroceries>["data"];
  snapshot: Awaited<ReturnType<typeof fetchHealthSnapshot>> | undefined;
  isLoading: boolean;
  recommendations: WorkloadRecommendationItem[];
}

export function useHealthDashboard(): HealthDashboardData {
  const habits = useHealthHabits();
  const training = useHealthTrainingPlans();
  const meals = useHealthMealPlans();
  const recovery = useHealthRecovery();
  const workload = useHealthWorkload();
  const groceries = useHealthGroceries();
  const snapshot = useHealthSnapshot();

  const isLoading =
    habits.isLoading ||
    training.isLoading ||
    meals.isLoading ||
    recovery.isLoading ||
    workload.isLoading ||
    groceries.isLoading ||
    snapshot.isLoading;

  const workloadData = workload.data ?? null;
  const recommendations = Array.isArray(workloadData?.recommendations)
    ? workloadData.recommendations
    : [];

  return {
    habits: habits.data ?? [],
    trainingPlans: training.data ?? [],
    mealPlans: meals.data ?? [],
    recovery: recovery.data ?? [],
    workload: workloadData,
    groceries: groceries.data ?? [],
    snapshot: snapshot.data,
    isLoading,
    recommendations,
  };
}
