/**
 * ContentCalendarPanel — calendar grid with drag-to-reschedule.
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
import { cn } from "@/lib/utils";
import { Calendar, GripVertical, ExternalLink } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import {
  useContentItems,
  useMoveContentCalendar,
} from "@/hooks/use-content-dashboard";
import type { ContentItem, ContentFilters, ContentStatus } from "@/types/content-dashboard";

const DAYS_TO_SHOW = 7;

function CalendarItemCard({
  item,
  isDragging = false,
}: {
  item: ContentItem;
  isDragging?: boolean;
}) {
  const scheduled = item.scheduledAt
    ? format(parseISO(item.scheduledAt), "MMM d, HH:mm")
    : "—";
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
        </div>
      </div>
    </div>
  );
}

function DraggableCalendarItem({ item }: { item: ContentItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <CalendarItemCard item={item} isDragging={isDragging} />
    </div>
  );
}

function DroppableDayCell({
  date,
  items,
}: {
  date: Date;
  items: ContentItem[];
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
        "min-h-[120px] rounded-lg border border-white/[0.03] bg-card/50 p-2 transition-all duration-200",
        isOver && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background bg-primary/5"
      )}
    >
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {format(date, "EEE MMM d")}
      </p>
      <div className="space-y-2">
        {(dayItems ?? []).map((i) => (
          <DraggableCalendarItem key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}

export interface ContentCalendarPanelProps {
  search?: string;
  filters?: ContentFilters | { statuses?: ContentStatus[]; projectIds?: string[] };
  onRunSelect?: (runId: string | null) => void;
  className?: string;
}

export function ContentCalendarPanel({
  search = "",
  filters = {},
  className,
}: ContentCalendarPanelProps) {
  const { data, isLoading } = useContentItems({
    search: search || undefined,
    filters: (filters && (filters.statuses?.length || filters.projectIds?.length))
      ? { statuses: filters.statuses, projectIds: filters.projectIds }
      : undefined,
    limit: 50,
  });
  const moveCalendar = useMoveContentCalendar();

  const items = data?.items ?? [];
  const scheduledItems = items.filter((i) => i.scheduledAt);

  const weekStart = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    []
  );
  const days = useMemo(
    () =>
      Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
        addDays(weekStart, i)
      ),
    [weekStart]
  );

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
      moveCalendar.mutate({ id: itemId, scheduledAt: newScheduledAt });
    },
    [scheduledItems, moveCalendar]
  );

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal" />
            Content Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal" />
              Content Calendar
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Drag items to reschedule
            </p>
          </div>
          <Link to="/dashboard/content/calendar">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              Full calendar
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map((d) => (
              <DroppableDayCell
                key={d.toISOString()}
                date={d}
                items={scheduledItems}
              />
            ))}
          </div>
          <DragOverlay>
            {activeItem ? (
              <CalendarItemCard item={activeItem} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}

