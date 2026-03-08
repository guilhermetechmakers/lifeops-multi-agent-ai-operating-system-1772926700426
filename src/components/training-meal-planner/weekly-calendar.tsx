/**
 * Weekly Calendar — Grid with days, time blocks for workouts and meals.
 * Drag/drop or quick-add; sync with calendar action.
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
import { addDays, addWeeks, format, startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, UtensilsCrossed, CalendarSync } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleItem, MealPlanItem, WorkoutPlanItem } from "@/types/training-meals";

export interface WeeklyCalendarProps {
  schedule: ScheduleItem[];
  meals: MealPlanItem[];
  workouts: WorkoutPlanItem[];
  weekStartDate: Date;
  onWeekChange: (date: Date) => void;
  onScheduleUpdate?: (schedule: ScheduleItem[]) => void;
  onSyncCalendar?: () => void;
  isLoading?: boolean;
  className?: string;
}

interface CalendarSlot {
  date: Date;
  dateStr: string;
  label: string;
}

function ScheduleCard({
  item,
  meal,
  workout,
  isOverlay,
}: {
  item: ScheduleItem;
  meal?: MealPlanItem | null;
  workout?: WorkoutPlanItem | null;
  isOverlay?: boolean;
}) {
  const isMeal = item.type === "meal";
  const ref = isMeal ? meal : workout;
  const name = ref?.name ?? (isMeal ? "Meal" : "Workout");
  const duration = workout?.durationMin ?? 30;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/[0.03] px-2 py-1.5 text-xs transition-all duration-200",
        isMeal ? "bg-amber/10 text-amber" : "bg-teal/10 text-teal",
        isOverlay && "shadow-lg ring-2 ring-white/10"
      )}
    >
      {isMeal ? (
        <UtensilsCrossed className="h-3 w-3 shrink-0" />
      ) : (
        <Dumbbell className="h-3 w-3 shrink-0" />
      )}
      <span className="truncate font-medium">{name}</span>
      {!isMeal && <span className="text-muted-foreground">{duration}m</span>}
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <ScheduleCard item={item} meal={meal} workout={workout} isOverlay={isDragging} />
    </div>
  );
}

function DroppableDaySlot({
  dateStr,
  label,
  items,
  mealMap,
  workoutMap,
}: {
  dateStr: string;
  label: string;
  items: ScheduleItem[];
  mealMap: Map<string, MealPlanItem>;
  workoutMap: Map<string, WorkoutPlanItem>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${dateStr}`, data: { dateStr } });
  return (
    <div className="flex flex-col gap-1">
      <div className="text-center text-xs font-medium text-muted-foreground">{label}</div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[80px] rounded-lg border border-dashed border-white/[0.06] bg-secondary/20 p-2 transition-colors duration-200",
          isOver && "border-teal/40 bg-teal/5"
        )}
        data-slot-id={`slot:${dateStr}`}
      >
        {(items ?? []).map((item) => (
          <DraggableScheduleCard
            key={item.id}
            item={item}
            meal={item.type === "meal" ? mealMap.get(item.referenceId) : null}
            workout={item.type === "workout" ? workoutMap.get(item.referenceId) : null}
          />
        ))}
      </div>
    </div>
  );
}

export function WeeklyCalendar({
  schedule = [],
  meals = [],
  workouts = [],
  weekStartDate,
  onWeekChange,
  onScheduleUpdate,
  onSyncCalendar,
  isLoading = false,
  className,
}: WeeklyCalendarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  const safeMeals = Array.isArray(meals) ? meals : [];
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];

  const mealMap = useMemo(() => new Map(safeMeals.map((m) => [m.id, m])), [safeMeals]);
  const workoutMap = useMemo(() => new Map(safeWorkouts.map((w) => [w.id, w])), [safeWorkouts]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(weekStartDate, { weekStartsOn: 1 });
    const end = endOfWeek(weekStartDate, { weekStartsOn: 1 });
    const days: CalendarSlot[] = [];
    let cur = start;
    while (cur <= end) {
      days.push({
        date: cur,
        dateStr: format(cur, "yyyy-MM-dd"),
        label: format(cur, "EEE"),
      });
      cur = addDays(cur, 1);
    }
    return days;
  }, [weekStartDate]);

  const getItemsForDay = useCallback(
    (dateStr: string) => {
      return safeSchedule.filter((s) => (s?.date ?? "") === dateStr);
    },
    [safeSchedule]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || !onScheduleUpdate) return;
      const itemId = String(active.id);
      const overId = String(over.id);
      if (!overId.startsWith("slot:")) return;
      const dateStr = overId.replace("slot:", "");
      const item = safeSchedule.find((s) => s.id === itemId);
      if (!item) return;
      const updated = safeSchedule.map((s) =>
        s.id === itemId ? { ...s, date: dateStr } : s
      );
      onScheduleUpdate(updated);
    },
    [onScheduleUpdate, safeSchedule]
  );

  const navigate = useCallback(
    (dir: number) => {
      onWeekChange(addWeeks(weekStartDate, dir));
    },
    [weekStartDate, onWeekChange]
  );

  const activeItem = activeId ? safeSchedule.find((s) => s.id === activeId) : null;

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">Weekly calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 21 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-5 w-5 text-teal" aria-hidden />
          Weekly calendar
        </CardTitle>
        <div className="flex items-center gap-2">
          {onSyncCalendar && (
            <Button variant="outline" size="sm" onClick={onSyncCalendar}>
              <CalendarSync className="mr-1 h-3 w-3" />
              Sync calendar
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium text-foreground">
            {format(startOfWeek(weekStartDate, { weekStartsOn: 1 }), "MMM d")} –{" "}
            {format(endOfWeek(weekStartDate, { weekStartsOn: 1 }), "MMM d")}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Weekly schedule">
            {weekDays.map((day) => (
              <DroppableDaySlot
                key={day.dateStr}
                dateStr={day.dateStr}
                label={day.label}
                items={getItemsForDay(day.dateStr)}
                mealMap={mealMap}
                workoutMap={workoutMap}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem ? (
              <ScheduleCard
                item={activeItem}
                meal={activeItem.type === "meal" ? mealMap.get(activeItem.referenceId) : null}
                workout={activeItem.type === "workout" ? workoutMap.get(activeItem.referenceId) : null}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}
