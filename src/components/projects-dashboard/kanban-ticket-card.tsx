/**
 * KanbanTicketCard — draggable ticket card.
 */

import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types/projects";

export interface KanbanTicketCardProps {
  ticket: Ticket;
  isDragging?: boolean;
}

const PRIORITY_VARIANTS: Record<string, "secondary" | "default" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

export function KanbanTicketCard({ ticket, isDragging }: KanbanTicketCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: ticket.id,
  });

  const variant = PRIORITY_VARIANTS[ticket.priority] ?? "secondary";

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing border-white/[0.03] bg-card transition-all hover:shadow-md",
        isDragging && "opacity-90 shadow-lg rotate-1"
      )}
    >
      <CardContent className="p-3">
        <p className="text-sm font-medium text-foreground line-clamp-2">{ticket.title}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <Badge variant={variant} className="text-[10px]">
            {ticket.priority}
          </Badge>
          {ticket.assigneeName && (
            <span className="text-xs text-muted-foreground truncate">{ticket.assigneeName}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
