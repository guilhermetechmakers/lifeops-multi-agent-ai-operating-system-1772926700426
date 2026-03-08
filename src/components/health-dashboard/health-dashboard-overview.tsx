/**
 * HealthDashboardOverview — Main Health Dashboard view.
 * Aggregates Health Snapshot, Habits, Training/Meals, Recovery/Workload, Notifications, Grocery list.
 */

import { useCallback } from "react";
import { HealthSnapshotCard } from "./health-snapshot-card";
import { HabitsPanel } from "./habits-panel";
import { TrainingMealPanel } from "./training-meal-panel";
import { RecoveryAndWorkloadPanel } from "./recovery-and-workload-panel";
import { NotificationsTray } from "./notifications-tray";
import { GroceryListPanel } from "./grocery-list-panel";
import { useHealthDashboard, useApplyWorkloadAdjustment, useSyncCalendar } from "@/hooks/use-health-dashboard";
import { toast } from "sonner";
import type { Intervention } from "@/types/health";

const MOCK_INTERVENTIONS: Intervention[] = [
  { id: "i1", type: "coaching", message: "Consider adding 2 min to morning meditation.", acknowledged: false },
  { id: "i2", type: "reminder", message: "Evening journal reminder in 2 hours.", acknowledged: false },
];

export function HealthDashboardOverview() {
  const {
    habits,
    trainingPlans,
    mealPlans,
    recovery,
    workload,
    groceries,
    snapshot,
    isLoading,
  } = useHealthDashboard();

  const applyMutation = useApplyWorkloadAdjustment();
  const syncCalendarMutation = useSyncCalendar();

  const handleApplyRecommendation = useCallback(
    (id: string) => {
      applyMutation.mutate({ recommendationId: id, accepted: true });
    },
    [applyMutation]
  );

  const handleSyncCalendar = useCallback(() => {
    syncCalendarMutation.mutate(undefined);
  }, [syncCalendarMutation]);

  const handleGenerateGroceryList = useCallback(() => {
    toast.success("Grocery list generated");
  }, []);

  const handleAcknowledge = useCallback((_id: string) => {
    toast.success("Notification acknowledged");
  }, []);

  const handleSnooze = useCallback((_id: string) => {
    toast.success("Notification snoozed");
  }, []);

  return (
    <div className="space-y-8">
      <HealthSnapshotCard
        snapshot={snapshot ?? null}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <HabitsPanel habits={Array.isArray(habits) ? habits : []} isLoading={isLoading} />
        <TrainingMealPanel
          trainingPlans={Array.isArray(trainingPlans) ? trainingPlans : []}
          mealPlans={Array.isArray(mealPlans) ? mealPlans : []}
          onSyncCalendar={handleSyncCalendar}
          onGenerateGroceryList={handleGenerateGroceryList}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NotificationsTray
          interventions={MOCK_INTERVENTIONS}
          onAcknowledge={handleAcknowledge}
          onSnooze={handleSnooze}
        />
        <GroceryListPanel groceries={Array.isArray(groceries) ? groceries : []} onExport={() => toast.success("Exported")} />
      </div>

        <RecoveryAndWorkloadPanel
          recoveryMetrics={Array.isArray(recovery) ? recovery : []}
          workloadRecommendations={workload ?? null}
          onApplyRecommendation={handleApplyRecommendation}
          isApplying={applyMutation.isPending}
          isLoading={isLoading}
        />
    </div>
  );
}
