/**
 * KanbanColumn — droppable column for tickets with drag-and-drop.
 */

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types/projects";
import { TicketCard } from "./ticket-card";

export interface KanbanColumnProps {
  id: string;
  title: string;
  tickets: Ticket[];
  onMoveTicket?: (ticketId: string, targetStatus: string) => void;
  onEditTicket?: (ticket: Ticket) => void;
  onBulkAction?: () => void;
  onOpenTicket?: (ticket: Ticket) => void;
  onBulkToggle?: (ticketId: string) => void;
  selectedTicketIds?: string[];
  capacity?: number;
  usedCapacity?: number;
}

export function KanbanColumn({
  id,
  title,
  tickets,
  onOpenTicket,
  onBulkToggle,
  selectedTicketIds = [],
  capacity,
  usedCapacity,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const ticketList = tickets ?? [];
  const selected = Array.isArray(selectedTicketIds) ? selectedTicketIds : [];
  const showCapacity =
    capacity != null &&
    usedCapacity != null &&
    (id === "in_progress" || id === "backlog");

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "shrink-0 w-64 rounded-xl border border-white/[0.03] bg-[#151718]/80 transition-all duration-200 min-h-[320px] flex flex-col",
        isOver && "ring-2 ring-primary/40 bg-[#151718]"
      )}
    >
      <div className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
            {ticketList.length}
          </span>
        </div>
        {showCapacity && (
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  (usedCapacity ?? 0) > (capacity ?? 0)
                    ? "bg-destructive"
                    : "bg-teal"
                )}
                style={{
                  width: `${Math.min(
                    100,
                    ((usedCapacity ?? 0) / (capacity ?? 1)) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {usedCapacity ?? 0}/{capacity ?? 0}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto">
        {(ticketList ?? []).map((t) => (
          <TicketCard
            key={t.id}
            ticket={t}
            onOpen={onOpenTicket}
            onBulkToggle={onBulkToggle}
            isSelected={selected.includes(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
