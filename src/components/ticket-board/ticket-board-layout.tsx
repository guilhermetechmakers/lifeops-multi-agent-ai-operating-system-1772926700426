/**
 * TicketBoardLayout — container wiring board, sprint planner, automation panel, filters.
 */

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/types/projects";
import {
  useTicketBoardTickets,
  useTicketBoardSprints,
  useMoveTicketBoardTicket,
  useBulkUpdateTicketBoard,
  useRunTicketBoardAutomation,
  usePatchTicketBoardTicket,
} from "@/hooks/use-ticket-board";
import type { TicketFilters } from "@/api/ticket-board";
import { KanbanColumn } from "./kanban-column";
import { TicketCard } from "./ticket-card";
import { BulkActionsBar, type BulkAction } from "./bulk-actions-bar";
import { FiltersAndSearchBar } from "./filters-and-search-bar";
import { AgentAutomationPanel } from "./agent-automation-panel";
import { SprintPlanner } from "./sprint-planner";
import { ProjectDetailTimelinePanel } from "./project-detail-timeline-panel";
import { QuickAddModal } from "@/components/project-detail/quick-add-modal";

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "ready", label: "Ready" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
];

export interface TicketBoardLayoutProps {
  projectId: string;
  initialSprintId?: string | null;
  userPermissions?: { canEdit?: boolean; canBulkEdit?: boolean };
  className?: string;
}

export function TicketBoardLayout({
  projectId,
  initialSprintId,
  userPermissions: _userPermissions = {},
  className,
}: TicketBoardLayoutProps) {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [activeSprintId, setActiveSprintId] = useState<string | null>(
    initialSprintId ?? null
  );
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const ticketFilters = useMemo((): TicketFilters => {
    const f: TicketFilters = { ...filters };
    if (activeSprintId) f.sprintId = activeSprintId;
    return f;
  }, [filters, activeSprintId]);

  const { items: tickets, isLoading } = useTicketBoardTickets(projectId, ticketFilters);
  const { items: sprints } = useTicketBoardSprints(projectId);
  const moveTicket = useMoveTicketBoardTicket(projectId);
  const bulkUpdate = useBulkUpdateTicketBoard(projectId);
  const runAutomation = useRunTicketBoardAutomation(projectId);
  const patchTicket = usePatchTicketBoardTicket(projectId);

  const sprintList = sprints ?? [];

  const ticketList = tickets ?? [];
  const selected = selectedTicketIds ?? new Set<string>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const getTicketsByStatus = useCallback(
    (status: TicketStatus) =>
      ticketList.filter((t) => t.status === status),
    [ticketList]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    const t = ticketList.find((x) => x.id === id) ?? null;
    setActiveTicket(t);
  }, [ticketList]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTicket(null);
      const { active, over } = event;
      if (!over) return;
      const ticketId = active.id as string;
      const overId = over.id as string;
      const columnIds = COLUMNS.map((c) => c.id);
      const targetStatus = columnIds.includes(overId as TicketStatus)
        ? (overId as TicketStatus)
        : (ticketList.find((t) => t.id === overId)?.status ??
            ticketList.find((t) => t.id === ticketId)?.status);
      const newStatus = targetStatus ?? ticketList.find((t) => t.id === ticketId)?.status;
      const ticket = ticketList.find((t) => t.id === ticketId);
      if (!ticket || !newStatus || ticket.status === newStatus) return;
      moveTicket.mutate({ ticketId, status: newStatus });
    },
    [ticketList, moveTicket]
  );

  const handleBulkToggle = useCallback((ticketId: string) => {
    setSelectedTicketIds((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });
  }, []);

  const handleBulkApply = useCallback(
    (action: BulkAction) => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      const payload = action.payload ?? {};
      if (action.type === "status" && payload.status) {
        bulkUpdate.mutate({ ids, updates: { status: payload.status as TicketStatus } });
        setSelectedTicketIds(new Set());
      } else if (action.type === "assign" && payload.assigneeId) {
        bulkUpdate.mutate({ ids, updates: { assigneeId: payload.assigneeId as string } });
        setSelectedTicketIds(new Set());
      } else if (action.type === "tag" && payload.labels) {
        bulkUpdate.mutate({ ids, updates: { labels: payload.labels as string[] } });
        setSelectedTicketIds(new Set());
      } else if (action.type === "snooze" && payload.snoozedUntil) {
        bulkUpdate.mutate({
          ids,
          updates: { snoozedUntil: payload.snoozedUntil as string },
        });
        setSelectedTicketIds(new Set());
      } else if (action.type === "pr_summary") {
        runAutomation.mutate(undefined);
      } else {
        setSelectedTicketIds(new Set());
      }
    },
    [selected, bulkUpdate, runAutomation]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedTicketIds(new Set());
  }, []);

  const handleSnooze = useCallback(
    (ticket: Ticket, until: string) => {
      patchTicket.mutate({ ticketId: ticket.id, data: { snoozedUntil: until } });
    },
    [patchTicket]
  );

  const getColumnCapacity = useCallback(
    (status: TicketStatus) => {
      const colTickets = getTicketsByStatus(status);
      const totalPoints = colTickets.reduce(
        (sum, t) => sum + (t.storyPoints ?? 0),
        0
      );
      return { used: totalPoints, capacity: 40 };
    },
    [getTicketsByStatus]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-64 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header: project context, sprint selector, quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FiltersAndSearchBar
          filters={filters}
          onFiltersChange={setFilters}
          sprints={sprintList}
        />
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="gap-1.5 transition-transform duration-200 hover:scale-[1.02]"
            onClick={() => setQuickAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 transition-transform duration-200 hover:scale-[1.02]"
            onClick={() => runAutomation.mutate(undefined)}
          >
            <Zap className="h-4 w-4" />
            Run Summary
          </Button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <BulkActionsBar
          selectedTicketIds={Array.from(selected)}
          onBulkApply={handleBulkApply}
          onClear={handleClearSelection}
        />
      )}

      {/* Main layout: board + right panels */}
      <div className="flex gap-6">
        {/* Kanban board */}
        <div className="flex-1 min-w-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[360px] animate-fade-in">
              {COLUMNS.map((col) => {
                const cap = getColumnCapacity(col.id);
                return (
                  <KanbanColumn
                    key={col.id}
                    id={col.id}
                    title={col.label}
                    tickets={getTicketsByStatus(col.id)}
                    onOpenTicket={() => {}}
                    onBulkToggle={handleBulkToggle}
                    onSnooze={handleSnooze}
                    selectedTicketIds={Array.from(selected)}
                    capacity={col.id === "in_progress" ? cap.capacity : undefined}
                    usedCapacity={
                      col.id === "in_progress" ? cap.used : undefined
                    }
                  />
                );
              })}
            </div>
            <DragOverlay>
              {activeTicket ? (
                <TicketCard ticket={activeTicket} isDragging />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Right panels: automation, sprint planner, timeline */}
        <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
          <SprintPlanner
            projectId={projectId}
            tickets={ticketList}
            activeSprintId={activeSprintId}
            onSprintSelect={setActiveSprintId}
          />
          <AgentAutomationPanel projectId={projectId} />
          <ProjectDetailTimelinePanel projectId={projectId} />
        </div>
      </div>

      {/* Mobile: stacked panels */}
      <div className="lg:hidden space-y-4">
        <SprintPlanner
          projectId={projectId}
          tickets={ticketList}
          activeSprintId={activeSprintId}
          onSprintSelect={setActiveSprintId}
        />
        <AgentAutomationPanel projectId={projectId} />
        <ProjectDetailTimelinePanel projectId={projectId} />
      </div>

      <QuickAddModal
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        projectId={projectId}
        type="ticket"
      />
    </div>
  );
}
