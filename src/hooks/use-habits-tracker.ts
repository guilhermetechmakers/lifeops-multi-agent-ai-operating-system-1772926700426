/**
 * useHabitsTracker — React Query hooks for Habits Tracker.
 * Centralizes habit state, check-ins, coaching, and history.
 * All array operations guarded; useState defaults for arrays.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  recordCheckin,
  fetchCoachingContext,
  recordCoachingAction,
  fetchHabitHistory,
  type CreateHabitPayload,
} from "@/api/health";
import type { CoachingContext } from "@/types/health";
import { HEALTH_QUERY_KEYS } from "./use-health-dashboard";

export const HABITS_QUERY_KEYS = {
  ...HEALTH_QUERY_KEYS,
  coaching: ["health", "coaching"] as const,
  history: (habitId: string, from: string, to: string) =>
    ["health", "habit-history", habitId, from, to] as const,
};

export function useHabitsTracker() {
  const qc = useQueryClient();
  const habitsQuery = useQuery({
    queryKey: HEALTH_QUERY_KEYS.habits,
    queryFn: fetchHabits,
  });
  const habits = habitsQuery.data ?? [];
  const safeHabits = Array.isArray(habits) ? habits : [];

  const createMutation = useMutation({
    mutationFn: (payload: CreateHabitPayload) => createHabit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.habits });
      toast.success("Habit created");
    },
    onError: () => toast.error("Failed to create habit"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateHabitPayload> }) =>
      updateHabit(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.habits });
      toast.success("Habit updated");
    },
    onError: () => toast.error("Failed to update habit"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.habits });
      toast.success("Habit deleted");
    },
    onError: () => toast.error("Failed to delete habit"),
  });

  const checkinMutation = useMutation({
    mutationFn: ({
      habitId,
      date,
      completed,
      notes,
    }: {
      habitId: string;
      date: string;
      completed: boolean;
      notes?: string;
    }) => recordCheckin(habitId, { date, completed, notes }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.habits });
      qc.invalidateQueries({
        queryKey: HABITS_QUERY_KEYS.history(vars.habitId, vars.date, vars.date),
      });
      toast.success("Check-in recorded");
    },
    onError: () => toast.error("Failed to record check-in"),
  });

  return {
    habits: safeHabits,
    isLoading: habitsQuery.isLoading,
    createHabit: createMutation.mutateAsync,
    updateHabit: (id: string, payload: Partial<CreateHabitPayload>) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteHabit: deleteMutation.mutateAsync,
    recordCheckin: checkinMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCheckinPending: checkinMutation.isPending,
  };
}

export function useCoachingContext(habitId?: string) {
  const q = useQuery({
    queryKey: [...HABITS_QUERY_KEYS.coaching, habitId ?? "all"],
    queryFn: () => fetchCoachingContext(habitId),
  });
  const data = q.data ?? ({} as CoachingContext);
  return {
    ...q,
    context: data,
    nudges: Array.isArray(data?.nudges) ? data.nudges : [],
    microActions: Array.isArray(data?.microActions) ? data.microActions : [],
    adaptiveSuggestions: Array.isArray(data?.adaptiveSuggestions) ? data.adaptiveSuggestions : [],
  };
}

export function useCoachingActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { actionId: string; approved: boolean }) =>
      recordCoachingAction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HABITS_QUERY_KEYS.coaching });
    },
  });
}

export function useHabitHistory(habitId: string, range: { from: string; to: string }) {
  const q = useQuery({
    queryKey: HABITS_QUERY_KEYS.history(habitId, range.from, range.to),
    queryFn: () => fetchHabitHistory(habitId, range),
    enabled: !!habitId && !!range.from && !!range.to,
  });
  const data = q.data ?? [];
  return {
    ...q,
    history: Array.isArray(data) ? data : [],
  };
}
