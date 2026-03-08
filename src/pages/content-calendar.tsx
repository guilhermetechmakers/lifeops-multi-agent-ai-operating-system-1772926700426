/**
 * Content Calendar — full calendar view with drag-to-schedule, conflict detection,
 * Quick Create, Conflicts Panel, and Audit Trail.
 */

import { useCallback, useMemo, useState } from "react";
import { format, startOfWeek, endOfMonth } from "date-fns";
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
  useAuditLogs,
  useLogAudit,
} from "@/hooks/use-content-calendar";
import type { CreateCalendarItemPayload } from "@/types/content-calendar";

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

  return (
    <AnimatedPage className="max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Content Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Drag to reschedule. Month, week, and day views with conflict
              detection.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/dashboard/content">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ExternalLink className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setQuickCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Quick Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
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
              isLoading={isLoading}
            />
          </div>

          <div className="flex flex-col gap-4 xl:max-w-[320px]">
            {showConflicts && (
              <ConflictsPanel
                conflicts={conflicts}
                channels={channelList}
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
