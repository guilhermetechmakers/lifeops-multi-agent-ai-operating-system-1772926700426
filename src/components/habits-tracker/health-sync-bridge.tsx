/**
 * HealthSyncBridge — Data flow between Habits Tracker, Health Automation, and Health Dashboard.
 * Triggers: on habit create/update, on check-in, on cadence changes.
 * This component does not render UI; it uses hooks to invalidate health queries when habit data
 * changes so the Health Dashboard and Training/Meal plans stay in sync.
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HEALTH_QUERY_KEYS } from "@/hooks/use-health-dashboard";

export interface HealthSyncBridgeProps {
  /** When true, invalidate health dashboard queries (e.g. after habit mutation). */
  invalidateOnChange?: boolean;
  /** Dependency that when changed triggers invalidation (e.g. habits length or last update timestamp). */
  changeSignal?: unknown;
  /** Habit IDs; when combined with lastCheckIn, used as change signal for invalidation. */
  habitIds?: string[];
  /** Last check-in; when changed, triggers health dashboard invalidation. */
  lastCheckIn?: { habitId: string; date: string } | null;
}

/**
 * HealthSyncBridge component. Mount it inside Habits Tracker to keep Health Dashboard
 * and Health Automation data in sync when habits or check-ins change.
 */
export function HealthSyncBridge({
  invalidateOnChange = true,
  changeSignal,
  habitIds = [],
  lastCheckIn,
}: HealthSyncBridgeProps) {
  const qc = useQueryClient();
  const signal = changeSignal ?? JSON.stringify({ habitIds: habitIds ?? [], lastCheckIn });
  const prevSignal = useRef(signal);

  useEffect(() => {
    if (!invalidateOnChange) return;
    if (prevSignal.current !== signal) {
      prevSignal.current = signal;
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.habits });
      qc.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.snapshot });
      qc.invalidateQueries({ queryKey: ["health", "workload"] });
    }
  }, [invalidateOnChange, signal, qc]);

  return null;
}
