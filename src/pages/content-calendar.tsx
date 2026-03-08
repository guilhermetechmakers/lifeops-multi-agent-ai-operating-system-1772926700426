/**
 * Content Calendar — full calendar view with drag-to-schedule, conflict detection,
 * Quick Create, Conflicts Panel, and Audit Trail.
 */

import { useCallback, useMemo, useState } from "react";
import { format, startOfWeek, endOfMonth, addDays, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { ExternalLink, Plus, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import {
  CalendarView,
  ConflictsPanel,
  QuickCreateModal,
  AuditTrailPanel,
  detectConflicts,
} from "@/components/content-calendar";
import {
  useCalendarItems,
  useChannels,
  useChannelCapacity,
  useUpdateCalendarItem,
  useCreateCalendarItem,
  useBulkReschedule,
  useAuditLogs,
  useLogAudit,
} from "@/hooks/use-content-calendar";
import type { CreateCalendarItemPayload } from "@/types/content-calendar";
import type { Conflict } from "@/types/content-calendar";

export default function ContentCalendarPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [showConflicts, setShowConflicts] = useState(true);
  const [showAudit] = useState(true);

  const weekStart = useMemo(
    () => startOfWeek(viewDate, { weekStartsOn: 1 }),
    [viewDate]
  );
  const monthEnd = useMemo(() => endOfMonth(viewDate), [viewDate]);

  const query = useMemo(
    () => ({
      start: weekStart.toISOString(),
      end: monthEnd.toISOString(),
    }),
    [weekStart, monthEnd]
  );

  const { items, isLoading } = useCalendarItems(query);
  const { channels } = useChannels();
  const { capacity } = useChannelCapacity();
  const updateItem = useUpdateCalendarItem();
  const createItem = useCreateCalendarItem();
  const bulkReschedule = useBulkReschedule();
  const { logs, isLoading: auditLoading } = useAuditLogs({ limit: 20 });
  const logAudit = useLogAudit();

  const channelList = channels ?? [];
  const capacityMap = capacity ?? {};
  const conflicts = useMemo(
    () => detectConflicts(items, channelList, capacityMap),
    [items, channelList, capacityMap]
  );

  const handleItemMove = useCallback(
    async (itemId: string, newPublishAt: string, newChannelId?: string) => {
      const payload: { publishAt: string; channelId?: string } = {
        publishAt: newPublishAt,
      };
      if (newChannelId) payload.channelId = newChannelId;
      await updateItem.mutateAsync({ id: itemId, payload });
      logAudit.mutate({
        action: "reschedule",
        actorId: "current-user",
        targetItemId: itemId,
        details: `Moved to ${newPublishAt}${newChannelId ? ` (channel: ${newChannelId})` : ""}`,
      });
    },
    [updateItem, logAudit]
  );

  const handleItemClick = useCallback((_item: { id: string }) => {
    // Navigate to editor - handled by ContentCard Link
  }, []);

  const handleQuickCreate = useCallback(
    async (payload: CreateCalendarItemPayload) => {
      await createItem.mutateAsync(payload);
      logAudit.mutate({
        action: "create",
        actorId: "current-user",
        targetItemId: "new",
        details: `Created "${payload.title}" for ${payload.publishAt}`,
      });
    },
    [createItem, logAudit]
  );

  const handleConflictReschedule = useCallback(
    async (conflict: Conflict) => {
      const firstDate = conflict.slotStart ? parseISO(conflict.slotStart) : new Date();
      const nextSlot = format(addDays(firstDate, 1), "yyyy-MM-dd") + "T10:00:00Z";
      await bulkReschedule.mutateAsync({
        itemIds: conflict.itemIds ?? [],
        newPublishAt: nextSlot,
      });
      logAudit.mutate({
        action: "reschedule",
        actorId: "current-user",
        targetItemId: conflict.itemIds?.[0] ?? "",
        details: `Resolved conflict: moved ${(conflict.itemIds ?? []).length} items to ${nextSlot}`,
      });
    },
    [bulkReschedule, logAudit]
  );

  const handleConflictReassign = useCallback(
    async (conflict: Conflict) => {
      const otherChannels = (channelList ?? []).filter((c) => c.id !== conflict.channelId);
      const targetChannelId = otherChannels[0]?.id ?? conflict.channelId;
      if (targetChannelId === conflict.channelId) return;
      const firstDate = conflict.slotStart ? parseISO(conflict.slotStart) : new Date();
      const slotStr = format(firstDate, "yyyy-MM-dd") + "T10:00:00Z";
      await bulkReschedule.mutateAsync({
        itemIds: conflict.itemIds ?? [],
        newPublishAt: slotStr,
        newChannelId: targetChannelId,
      });
      logAudit.mutate({
        action: "reassign",
        actorId: "current-user",
        targetItemId: conflict.itemIds?.[0] ?? "",
        details: `Reassigned ${(conflict.itemIds ?? []).length} items to channel ${targetChannelId}`,
      });
    },
    [channelList, bulkReschedule, logAudit]
  );

  const handleConflictApprove = useCallback(
    (conflict: Conflict) => {
      logAudit.mutate({
        action: "approve-conflict",
        actorId: "current-user",
        targetItemId: conflict.id,
        details: `Approved conflict for slot ${conflict.slotStart} (${(conflict.itemIds ?? []).length} items)`,
      });
    },
    [logAudit]
  );

  return (
    <AnimatedPage className="max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Content Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Drag to reschedule. Month, week, and day views with conflict
              detection.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/dashboard/content">
              <Button variant="ghost" size="sm" className="gap-1.5 transition-all duration-200 hover:scale-[1.02]">
                <ExternalLink className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button
              size="sm"
              className="gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              onClick={() => setQuickCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Quick Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 transition-all duration-200 hover:scale-[1.02]"
              onClick={() => setShowConflicts(!showConflicts)}
            >
              <PanelRightOpen className="h-4 w-4" />
              {showConflicts ? "Hide" : "Show"} Conflicts
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="min-w-0">
            <CalendarView
              items={items}
              channels={channelList}
              capacityMap={capacityMap}
              viewDate={viewDate}
              onViewDateChange={setViewDate}
              onItemMove={handleItemMove}
              onItemClick={handleItemClick}
              onEmptyStateAction={() => setQuickCreateOpen(true)}
              isLoading={isLoading}
            />
          </div>

          <div className="flex flex-col gap-4 xl:max-w-[320px]">
            {showConflicts && (
              <ConflictsPanel
                conflicts={conflicts}
                channels={channelList}
                onReschedule={handleConflictReschedule}
                onReassign={handleConflictReassign}
                onApprove={handleConflictApprove}
              />
            )}
            {showAudit && (
              <AuditTrailPanel logs={logs} isLoading={auditLoading} />
            )}
          </div>
        </div>
      </div>

      <QuickCreateModal
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        channels={channelList}
        defaultPublishAt={format(viewDate, "yyyy-MM-dd") + "T10:00"}
        onCreate={handleQuickCreate}
      />
    </AnimatedPage>
  );
}
