/**
 * CalendarView — Month/Week/Day views with channel lanes and drag-and-drop.
 */

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  startOfDay,
  isSameDay,
  isSameMonth,
  parseISO,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { ContentCard } from "./content-card";
import { ChannelLane } from "./channel-lane";
import { detectConflicts } from "./conflict-detector";
import type { ContentItem } from "@/types/content-calendar";
import type { Channel } from "@/types/content-calendar";

export type ViewMode = "month" | "week" | "day";

export interface CalendarViewProps {
  items: ContentItem[];
  channels: Channel[];
  capacityMap: Record<string, number>;
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  onItemMove?: (itemId: string, newPublishAt: string, newChannelId?: string) => void;
  onItemClick?: (item: ContentItem) => void;
  isLoading?: boolean;
}

export function CalendarView({
  items,
  channels,
  capacityMap,
  viewDate,
  onViewDateChange,
  onItemMove,
  onItemClick,
  isLoading = false,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const conflicts = useMemo(
    () => detectConflicts(items, channels, capacityMap),
    [items, channels, capacityMap]
  );

  const conflictSlotIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of conflicts) {
      for (const itemId of c.itemIds) {
        const item = items.find((i) => i.id === itemId);
        if (item?.publishAt) {
          set.add(`${item.channelId}-${item.publishAt.slice(0, 10)}`);
        }
      }
    }
    return set;
  }, [conflicts, items]);

  const { days } = useMemo(() => {
    if (viewMode === "day") {
      const d = startOfDay(viewDate);
      return {
        days: [{ date: d, label: format(d, "EEE MMM d") }],
      };
    }
    if (viewMode === "week") {
      const start = startOfWeek(viewDate, { weekStartsOn: 1 });
      const end = endOfWeek(viewDate, { weekStartsOn: 1 });
      const result: { date: Date; label: string }[] = [];
      let cur = start;
      while (cur <= end) {
        result.push({ date: cur, label: format(cur, "EEE MMM d") });
        cur = addDays(cur, 1);
      }
      return { days: result };
    }
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const result: { date: Date; label: string }[] = [];
    let cur = weekStart;
    while (cur <= monthEnd || result.length < 35) {
      result.push({ date: cur, label: format(cur, "EEE MMM d") });
      cur = addDays(cur, 1);
      if (result.length >= 42) break;
    }
    return { days: result };
  }, [viewDate, viewMode]);

  const getItemsForSlot = useCallback(
    (channelId: string, date: Date) => {
      return (items ?? []).filter((item) => {
        if (item.channelId !== channelId) return false;
        const d = item.publishAt ? parseISO(item.publishAt) : null;
        return d && isSameDay(d, date);
      });
    },
    [items]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;
      const item = items.find((i) => i.id === id) ?? null;
      setActiveItem(item);
    },
    [items]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);
      const { active, over } = event;
      if (!over || !onItemMove) return;
      const itemId = active.id as string;
      const overId = String(over.id);
      const parts = overId.split(":");
      if (parts[0] !== "slot" || parts.length < 3) return;
      const channelId = parts[1];
      const dateStr = parts[2];
      const newPublishAt = `${dateStr}T10:00:00Z`;
      onItemMove(itemId, newPublishAt, channelId);
    },
    [onItemMove]
  );

  const navigate = useCallback(
    (dir: number) => {
      if (viewMode === "day") {
        onViewDateChange(addDays(viewDate, dir));
      } else if (viewMode === "week") {
        onViewDateChange(addWeeks(viewDate, dir));
      } else {
        onViewDateChange(addMonths(viewDate, dir));
      }
    },
    [viewMode, viewDate, onViewDateChange]
  );

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-teal" />
            Content Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-teal" />
            Publishing Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-white/[0.03] p-0.5">
              {(["month", "week", "day"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-3 text-xs capitalize"
                  onClick={() => setViewMode(mode)}
                >
                  {mode}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate(-1)}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-foreground min-w-[140px] text-center text-sm">
              {viewMode === "day"
                ? format(viewDate, "MMMM d, yyyy")
                : viewMode === "week"
                  ? `Week of ${format(startOfWeek(viewDate, { weekStartsOn: 1 }), "MMM d")}`
                  : format(viewDate, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate(1)}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid gap-2" style={{ gridTemplateColumns: `200px repeat(${days.length}, minmax(140px, 1fr))` }}>
                <div className="p-2" />
                {days.map((d) => (
                  <div
                    key={d.date.toISOString()}
                    className={cn(
                      "text-center text-xs font-medium py-2",
                      viewMode === "month" && !isSameMonth(d.date, viewDate)
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    {format(d.date, "EEE d")}
                  </div>
                ))}
                {(channels ?? []).map((channel) => (
                  <div key={channel.id} className="contents">
                    <div
                      className="flex items-center gap-2 p-2 border-b border-white/[0.03]"
                    >
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: channel.color }}
                      />
                      <span className="text-sm font-medium text-foreground truncate">
                        {channel.name}
                      </span>
                    </div>
                    {days.map((d) => {
                      const dateStr = format(d.date, "yyyy-MM-dd");
                      const slotId = `slot:${channel.id}:${dateStr}`;
                      const slotItems = getItemsForSlot(channel.id, d.date);
                      const hasConflict = conflictSlotIds.has(
                        `${channel.id}-${dateStr}`
                      );
                      return (
                        <ChannelLane
                          key={slotId}
                          channel={channel}
                          items={slotItems}
                          slotId={slotId}
                          slotLabel={format(d.date, "MMM d")}
                          hasConflict={hasConflict}
                          onItemClick={onItemClick}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DragOverlay>
            {activeItem ? (
              <div className="w-64">
                <ContentCard
                  item={activeItem}
                  channel={(channels ?? []).find((c) => c.id === activeItem.channelId)}
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
