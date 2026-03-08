/**
 * HabitBoard — Main list and editor for Habits Tracker.
 * Composes HabitCard, HabitEditor, ReminderBell, StreakBadge, DailyCheckInPanel,
 * HabitHistoryView, AgentCoachPanel, NotificationsTray, DataVizPanel.
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Import, LayoutGrid } from "lucide-react";
import { HabitCard } from "./habit-card";
import { HabitEditor } from "./habit-editor";
import { DailyCheckInPanel } from "./daily-check-in-panel";
import { HabitHistoryView } from "./habit-history-view";
import { AgentCoachPanel } from "./agent-coach-panel";
import { DataVizPanel } from "./data-viz-panel";
import { HealthSyncBridge } from "./health-sync-bridge";
import { NotificationsTray } from "@/components/health-dashboard/notifications-tray";
import { useHabitsTracker, useHabitHistory } from "@/hooks/use-habits-tracker";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import type { Habit } from "@/types/health";
import type { CreateHabitPayload } from "@/api/health";

export interface HabitBoardProps {
  className?: string;
}

export function HabitBoard({ className }: HabitBoardProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);
  const [selectedHistoryHabitId, setSelectedHistoryHabitId] = useState<string>("");
  const [historyRange, setHistoryRange] = useState<{ from: string; to: string }>(() => {
    const to = new Date();
    const from = subDays(to, 30);
    return {
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
    };
  });
  const [lastCheckIn, setLastCheckIn] = useState<{ habitId: string; date: string } | null>(null);
  const [checkedToday, setCheckedToday] = useState<Set<string>>(() => new Set());

  const {
    habits,
    isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    recordCheckin,
    isCreating,
    isUpdating,
    isCheckinPending,
  } = useHabitsTracker();


  const selectedHabit = habits.find((h) => h?.id === selectedHistoryHabitId) ?? habits[0];
  const historyHabitId = selectedHistoryHabitId || (selectedHabit?.id ?? "");

  const { history, isLoading: historyLoading } = useHabitHistory(historyHabitId, historyRange);

  const safeHabits = Array.isArray(habits) ? habits : [];
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const handleCreate = useCallback(() => {
    setEditingHabit(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setEditorOpen(true);
  }, []);

  const handleEditorSubmit = useCallback(
    async (payload: CreateHabitPayload) => {
      if (editingHabit) {
        await updateHabit(editingHabit.id, payload);
      } else {
        await createHabit(payload);
      }
      setEditorOpen(false);
      setEditingHabit(null);
    },
    [editingHabit, createHabit, updateHabit]
  );

  const handleDelete = useCallback(
    async (habitId: string) => {
      await deleteHabit(habitId);
      if (editingHabit?.id === habitId) {
        setEditorOpen(false);
        setEditingHabit(null);
      }
    },
    [deleteHabit, editingHabit]
  );

  const handleCheckIn = useCallback(
    (habitId: string) => {
      const habit = safeHabits.find((h) => h?.id === habitId);
      setCheckInHabit(habit ?? null);
    },
    [safeHabits]
  );

  const handleCheckInSubmit = useCallback(
    async (habitId: string, date: string, completed: boolean, notes?: string) => {
      await recordCheckin({ habitId, date, completed, notes });
      setLastCheckIn({ habitId, date });
      if (date === todayStr && completed) {
        setCheckedToday((prev) => new Set(prev).add(habitId));
      }
      setCheckInHabit(null);
    },
    [recordCheckin, todayStr]
  );

  const interventions = (safeHabits ?? []).flatMap((h) =>
    (h?.coachInterventions ?? []).map((msg, i) => ({
      id: `${h?.id ?? ""}-coach-${i}`,
      type: "coaching" as const,
      message: msg ?? "",
      habitId: h?.id,
      acknowledged: false,
    }))
  );

  const isCheckedToday = (habitId: string) => {
    if (checkedToday.has(habitId)) return true;
    const habit = safeHabits.find((h) => h?.id === habitId);
    const last = habit?.lastCheckInDate;
    if (!last) return false;
    return last.slice(0, 10) === todayStr;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <HealthSyncBridge changeSignal={lastCheckIn ?? safeHabits.length} invalidateOnChange />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Habits</h2>
          <p className="text-sm text-muted-foreground">
            Create, track, and receive reminders; view streaks and coaching interventions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/health">
              <LayoutGrid className="mr-1 h-4 w-4" />
              Schedule view
            </Link>
          </Button>
          <Button variant="outline" size="sm" disabled aria-label="Import (coming soon)">
            <Import className="mr-1 h-4 w-4" />
            Import
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={isCreating} aria-label="New habit">
            <Plus className="mr-1 h-4 w-4" />
            New habit
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="all">All habits</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-lg bg-secondary/30" />
                  ))}
                </div>
              ) : safeHabits.length === 0 ? (
                <Card className="card-health border-white/[0.03]">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">No habits yet</p>
                    <Button className="mt-2" size="sm" onClick={handleCreate}>
                      Add first habit
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(safeHabits ?? []).map((habit) => (
                    <HabitCard
                      key={habit?.id ?? ""}
                      habit={habit}
                      onCheckIn={handleCheckIn}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isCheckedToday={isCheckedToday(habit?.id ?? "")}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-lg bg-secondary/30" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(safeHabits ?? []).map((habit) => (
                    <HabitCard
                      key={habit?.id ?? ""}
                      habit={habit}
                      onCheckIn={handleCheckIn}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isCheckedToday={isCheckedToday(habit?.id ?? "")}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {checkInHabit && (
            <DailyCheckInPanel
              habitId={checkInHabit.id}
              habitName={checkInHabit.name}
              date={todayStr}
              initialCompleted={isCheckedToday(checkInHabit.id)}
              onSubmitNote={handleCheckInSubmit}
              onClose={() => setCheckInHabit(null)}
              isPending={isCheckinPending}
            />
          )}

          <HabitHistoryView
            habitId={historyHabitId}
            habitName={selectedHabit?.name}
            habits={safeHabits}
            range={historyRange}
            data={history}
            onRangeChange={setHistoryRange}
            onHabitChange={setSelectedHistoryHabitId}
            isLoading={historyLoading}
          />
        </div>

        <div className="space-y-6">
          <NotificationsTray
            interventions={interventions}
            onAcknowledge={() => {}}
            onSnooze={() => {}}
          />
          <AgentCoachPanel habitId={selectedHistoryHabitId || undefined} />
          <DataVizPanel habits={safeHabits} />
        </div>
      </div>

      <HabitEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        habit={editingHabit}
        onSubmit={handleEditorSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
