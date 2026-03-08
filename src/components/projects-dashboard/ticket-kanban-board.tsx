/**
 * TicketKanbanBoard — Kanban lanes with drag-and-drop.
 */

import { useCallback, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectTickets, useMoveTicket } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/types/projects";
import { KanbanColumn } from "./kanban-column";
import { KanbanTicketCard } from "./kanban-ticket-card";

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
];

export interface TicketKanbanBoardProps {
  projectId: string;
  className?: string;
}

export function TicketKanbanBoard({ projectId, className }: TicketKanbanBoardProps) {
  const { items: tickets, isLoading } = useProjectTickets(projectId);
  const moveTicket = useMoveTicket(projectId);

  const ticketList = tickets ?? [];
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
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
        : (ticketList.find((t) => t.id === overId)?.status ?? ticketList.find((t) => t.id === ticketId)?.status);
      const newStatus = targetStatus ?? ticketList.find((t) => t.id === ticketId)?.status;
      const ticket = ticketList.find((t) => t.id === ticketId);
      if (!ticket || !newStatus || ticket.status === newStatus) return;
      moveTicket.mutate({ ticketId, status: newStatus as TicketStatus });
    },
    [ticketList, moveTicket]
  );

  const getTicketsByStatus = useCallback(
    (status: TicketStatus) => ticketList.filter((t) => t.status === status),
    [ticketList]
  );

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-56 shrink-0 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-2 min-h-[280px]">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.label}
                tickets={getTicketsByStatus(col.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTicket ? (
              <KanbanTicketCard ticket={activeTicket} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}

