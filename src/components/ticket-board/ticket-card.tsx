/**
 * TicketCard — compact card with title, meta, and action menu.
 */

import { useDraggable } from "@dnd-kit/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Tag, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types/projects";

const PRIORITY_VARIANTS: Record<string, "secondary" | "default" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

export interface TicketCardProps {
  ticket: Ticket;
  onOpen?: (ticket: Ticket) => void;
  onInlineEdit?: (ticket: Ticket) => void;
  onBulkToggle?: (ticketId: string) => void;
  isSelected?: boolean;
  isDragging?: boolean;
}

export function TicketCard({
  ticket,
  onOpen,
  onInlineEdit,
  onBulkToggle,
  isSelected = false,
  isDragging = false,
}: TicketCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: ticket.id });
  const variant = PRIORITY_VARIANTS[ticket.priority ?? "medium"] ?? "secondary";
  const labels = (ticket.labels ?? []).slice(0, 2);

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing border-white/[0.03] bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        isDragging && "opacity-90 shadow-lg rotate-1 scale-[1.02]",
        isSelected && "ring-2 ring-primary/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          {onBulkToggle && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onBulkToggle(ticket.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 shrink-0"
              aria-label={`Select ticket ${ticket.title}`}
            />
          )}
          <div
            className="flex-1 min-w-0"
            onClick={() => onOpen?.(ticket)}
            onKeyDown={(e) => e.key === "Enter" && onOpen?.(ticket)}
            role="button"
            tabIndex={0}
            aria-label={`Open ticket ${ticket.title}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={variant} className="text-[10px] capitalize shrink-0">
                {ticket.priority ?? "medium"}
              </Badge>
              {labels.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {(labels ?? []).map((l) => (
                    <span
                      key={l}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-2">{ticket.title}</p>
            <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
              {ticket.assigneeName && (
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarFallback className="text-[10px] bg-secondary">
                    {ticket.assigneeName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {ticket.storyPoints != null && (
                  <span>{ticket.storyPoints} pts</span>
                )}
                {ticket.dueDate && (
                  <span>{new Date(ticket.dueDate).toLocaleDateString()}</span>
                )}
                {ticket.updatedAt && (
                  <span title={ticket.updatedAt}>
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/[0.03] bg-[#151718]">
              <DropdownMenuItem onClick={() => onInlineEdit?.(ticket)}>
                <Pencil className="h-4 w-4 mr-2" />
                Quick edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="h-4 w-4 mr-2" />
                Add tag
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitBranch className="h-4 w-4 mr-2" />
                Convert to tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
