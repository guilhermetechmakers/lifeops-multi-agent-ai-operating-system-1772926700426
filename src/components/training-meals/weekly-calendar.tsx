/**
 * WeeklyCalendar — Grid of days with time blocks for workouts and meals.
 * Drag/drop to reschedule; Sync with Calendar action.
 */

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, UtensilsCrossed, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleItem, MealPlanItem, WorkoutPlanItem } from "@/types/training-meals";

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

interface ScheduleCardProps {
  item: ScheduleItem;
  meal?: MealPlanItem | null;
  workout?: WorkoutPlanItem | null;
  isDragging?: boolean;
}

function ScheduleCard({ item, meal, workout, isDragging }: ScheduleCardProps) {
  const isMeal = item?.type === "meal";
  const title = isMeal ? (meal?.name ?? "Meal") : (workout?.name ?? "Workout");
  const sub = isMeal
    ? null
    : workout
      ? `${workout.durationMin ?? 0} min · ${workout.intensity ?? ""}`
      : null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-white/[0.03] bg-secondary/60 px-3 py-2 text-left transition-all duration-200",
        "hover:bg-secondary/80 hover:shadow-sm",
        isDragging && "opacity-90 shadow-md ring-2 ring-primary/30"
      )}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" aria-hidden />
      {isMeal ? (
        <UtensilsCrossed className="h-4 w-4 shrink-0 text-amber" aria-hidden />
      ) : (
        <Dumbbell className="h-4 w-4 shrink-0 text-teal" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        <p className="text-xs text-muted-foreground mt-0.5">
          {item?.startTime ?? ""}
          {item?.endTime ? ` – ${item.endTime}` : ""}
        </p>
      </div>
    </div>
  );
}

function DraggableScheduleCard({
  item,
  meal,
  workout,
}: {
  item: ScheduleItem;
  meal?: MealPlanItem | null;
  workout?: WorkoutPlanItem | null;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
    data: { item },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <ScheduleCard item={item} meal={meal} workout={workout} />
    </div>
  );
}

function DayColumn({
  date,
  dateStr,
  items,
  meals,
  workouts,
  isOver,
}: {
  date: Date;
  dateStr: string;
  items: ScheduleItem[];
  meals: MealPlanItem[];
  workouts: WorkoutPlanItem[];
  isOver?: boolean;
}) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: dateStr,
    data: { date: dateStr },
  });
  const over = isOver || isDroppableOver;

  const resolved = useMemo(() => {
    return (items ?? []).map((s) => {
      const meal = (meals ?? []).find((m) => m.id === s.referenceId);
      const workout = (workouts ?? []).find((w) => w.id === s.referenceId);
      return { item: s, meal, workout };
    });
  }, [items, meals, workouts]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] rounded-lg border border-white/[0.03] bg-card/50 p-3 transition-all duration-200",
        over && "ring-2 ring-primary/40 bg-primary/5"
      )}
      role="region"
      aria-label={`Schedule for ${format(date, "EEEE MMM d")}`}
    >
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {format(date, "EEE")} <span className="text-foreground">{format(date, "d")}</span>
      </p>
      <div className="space-y-2">
        {(resolved ?? []).map(({ item: s, meal, workout }) => (
          <DraggableScheduleCard
            key={s.id}
            item={s}
            meal={meal}
            workout={workout}
          />
        ))}
      </div>
    </div>
  );
}

export interface WeeklyCalendarProps {
  schedule: ScheduleItem[];
  meals: MealPlanItem[];
  workouts: WorkoutPlanItem[];
  weekStartDate: Date;
  onScheduleChange: (newSchedule: ScheduleItem[]) => void;
  onSyncCalendar?: () => void;
  className?: string;
}

export function WeeklyCalendar({
  schedule = [],
  meals = [],
  workouts = [],
  weekStartDate,
  onScheduleChange,
  onSyncCalendar,
  className,
}: WeeklyCalendarProps) {
  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  const safeMeals = Array.isArray(meals) ? meals : [];
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];
  const weekStart = useMemo(
    () => startOfWeek(weekStartDate, { weekStartsOn: 1 }),
    [weekStartDate]
  );
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const scheduleByDate = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    weekDays.forEach((d) => {
      const str = format(d, "yyyy-MM-dd");
      map[str] = safeSchedule.filter((s) => (s?.date ?? "").slice(0, 10) === str);
    });
    return map;
  }, [safeSchedule, weekDays]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const item = active.data.current?.item as ScheduleItem | undefined;
      const targetDateStr = over.data.current?.date as string | undefined;
      if (!item || !targetDateStr) return;
      const newSchedule = safeSchedule.map((s) =>
        s.id === item.id ? { ...s, date: targetDateStr } : s
      );
      onScheduleChange(newSchedule);
    },
    [safeSchedule, onScheduleChange]
  );

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    const s = safeSchedule.find((i) => i.id === activeId);
    if (!s) return null;
    const meal = safeMeals.find((m) => m.id === s.referenceId);
    const workout = safeWorkouts.find((w) => w.id === s.referenceId);
    return { item: s, meal, workout };
  }, [activeId, safeSchedule, safeMeals, safeWorkouts]);

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden />
          Weekly calendar
        </CardTitle>
        {onSyncCalendar && (
          <Button variant="outline" size="sm" onClick={onSyncCalendar}>
            <Calendar className="mr-1 h-3 w-3" />
            Sync with calendar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {(weekDays ?? []).map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const items = scheduleByDate[dateStr] ?? [];
              return (
                <DayColumn
                  key={dateStr}
                  date={day}
                  dateStr={dateStr}
                  items={items}
                  meals={safeMeals}
                  workouts={safeWorkouts}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="rounded-lg border border-white/10 bg-card shadow-lg p-3 opacity-95">
                <ScheduleCard
                  item={activeItem.item}
                  meal={activeItem.meal}
                  workout={activeItem.workout}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}
