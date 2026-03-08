/**
 * Content Calendar — full calendar view with drag-to-schedule, conflict detection.
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";
import { Link } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import {
  useContentItems,
  useMoveContentCalendar,
} from "@/hooks/use-content-dashboard";
import type { ContentItem } from "@/types/content-dashboard";

function ContentCardInCalendar({
  item,
  isDragging = false,
}: {
  item: ContentItem;
  isDragging?: boolean;
}) {
  const scheduled = item.scheduledAt
    ? format(parseISO(item.scheduledAt), "MMM d, HH:mm")
    : "—";
  const statusColor =
    item.status === "published"
      ? "text-teal"
      : item.status === "ready-to-publish"
        ? "text-amber"
        : "text-muted-foreground";

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-secondary/80 p-3 transition-all duration-200",
        "hover:shadow-card-hover hover:-translate-y-0.5 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-90 shadow-lg scale-[1.02] ring-2 ring-primary/40"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {item.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{scheduled}</p>
          <span className={cn("text-xs font-medium", statusColor)}>
            {item.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function DraggableContentCard({ item }: { item: ContentItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <ContentCardInCalendar item={item} isDragging={isDragging} />
    </div>
  );
}

function DroppableDayCell({
  date,
  items,
  isCurrentMonth,
}: {
  date: Date;
  items: ContentItem[];
  isCurrentMonth: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date.toISOString().slice(0, 10)}`,
    data: { date },
  });
  const dayItems = (items ?? []).filter((i) => {
    const d = i.scheduledAt ? parseISO(i.scheduledAt) : null;
    return d && isSameDay(d, date);
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[140px] rounded-lg border border-white/[0.03] p-2 transition-all duration-200",
        isCurrentMonth ? "bg-card/50" : "bg-secondary/20",
        isOver &&
          "ring-2 ring-primary/40 ring-offset-2 ring-offset-background bg-primary/5"
      )}
    >
      <p
        className={cn(
          "text-xs font-medium mb-2",
          isCurrentMonth ? "text-muted-foreground" : "text-muted-foreground/60"
        )}
      >
        {format(date, "EEE MMM d")}
      </p>
      <div className="space-y-2">
        {(dayItems ?? []).map((i) => (
          <DraggableContentCard key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}

export default function ContentCalendarPage() {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [conflictItem, setConflictItem] = useState<{
    item: ContentItem;
    targetDate: string;
  } | null>(null);

  const { data, isLoading } = useContentItems({
    limit: 100,
  });
  const moveCalendar = useMoveContentCalendar();

  const items = data?.items ?? [];
  const scheduledItems = items.filter((i) => i.scheduledAt);

  const monthStart = useMemo(
    () => startOfMonth(viewMonth),
    [viewMonth]
  );
  const monthEnd = useMemo(() => endOfMonth(viewMonth), [viewMonth]);
  const weekStart = useMemo(
    () => startOfWeek(monthStart, { weekStartsOn: 1 }),
    [monthStart]
  );

  const days = useMemo(() => {
    const result: Date[] = [];
    let d = weekStart;
    while (d <= monthEnd || result.length < 35) {
      result.push(d);
      d = addDays(d, 1);
      if (result.length >= 42) break;
    }
    return result;
  }, [weekStart, monthEnd]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    const item = scheduledItems.find((i) => i.id === id) ?? null;
    setActiveItem(item);
  }, [scheduledItems]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);
      const { active, over } = event;
      if (!over) return;
      const itemId = active.id as string;
      const overId = String(over.id);
      if (!overId.startsWith("day-")) return;
      const dateStr = overId.replace("day-", "");
      const newScheduledAt = `${dateStr}T10:00:00Z`;
      const item = scheduledItems.find((i) => i.id === itemId);
      if (!item || !item.scheduledAt) return;

      const existingOnDay = scheduledItems.filter((i) => {
        const d = i.scheduledAt ? parseISO(i.scheduledAt) : null;
        return d && isSameDay(d, parseISO(dateStr));
      });
      if (existingOnDay.length >= 3) {
        setConflictItem({ item, targetDate: dateStr });
        return;
      }

      moveCalendar.mutate({ id: itemId, scheduledAt: newScheduledAt });
    },
    [scheduledItems, moveCalendar]
  );

  const handleConflictResolve = useCallback(() => {
    if (!conflictItem) return;
    moveCalendar.mutate({
      id: conflictItem.item.id,
      scheduledAt: `${conflictItem.targetDate}T10:00:00Z`,
    });
    setConflictItem(null);
  }, [conflictItem, moveCalendar]);

  if (isLoading) {
    return (
      <AnimatedPage className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Content Calendar
          </h1>
        </div>
        <Card className="border-white/[0.03] bg-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Content Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag to reschedule. Month/week/day views.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/content">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ExternalLink className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-foreground min-w-[140px] text-center">
            {format(viewMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-teal" />
            Publishing Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-7 gap-2">
              {days.map((d) => (
                <DroppableDayCell
                  key={d.toISOString()}
                  date={d}
                  items={scheduledItems}
                  isCurrentMonth={isSameMonth(d, viewMonth)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeItem ? (
                <ContentCardInCalendar item={activeItem} isDragging />
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>

      <Dialog open={!!conflictItem} onOpenChange={() => setConflictItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber" />
              Slot conflict
            </DialogTitle>
            <DialogDescription>
              This day has several items. Proceed to reschedule anyway?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConflictItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleConflictResolve}>Reschedule anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
