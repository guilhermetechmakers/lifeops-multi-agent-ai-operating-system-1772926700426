/**
 * KanbanColumn — droppable column for tickets.
 */

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/types/projects";
import { KanbanTicketCard } from "./kanban-ticket-card";

export interface KanbanColumnProps {
  id: TicketStatus;
  title: string;
  tickets: Ticket[];
}

export function KanbanColumn({ id, title, tickets }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "shrink-0 w-56 rounded-lg border border-white/[0.03] bg-secondary/30 transition-colors",
        isOver && "ring-2 ring-primary/50"
      )}
    >
      <div className="px-3 py-2 border-b border-white/[0.03]">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="ml-2 text-xs text-muted-foreground">{(tickets ?? []).length}</span>
      </div>
      <div className="p-2 space-y-2 min-h-[200px]">
        {(tickets ?? []).map((t) => (
          <KanbanTicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
