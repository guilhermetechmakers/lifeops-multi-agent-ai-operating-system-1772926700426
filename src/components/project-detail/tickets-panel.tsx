/**
 * TicketsPanel — card list of tickets with status, priority, assignee; bulk actions.
 */

import { useState, useCallback } from "react";
import { Ticket as TicketIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectTickets, useBulkUpdateTickets } from "@/hooks/use-projects";
import { QuickAddModal } from "./quick-add-modal";
import { BulkEditModal } from "./bulk-edit-modal";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/types/projects";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export interface TicketsPanelProps {
  projectId: string;
  className?: string;
}

export function TicketsPanel({ projectId, className }: TicketsPanelProps) {
  const { items: tickets, isLoading } = useProjectTickets(projectId);
  const bulkUpdate = useBulkUpdateTickets(projectId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const list = tickets ?? [];

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkEdit = useCallback(() => {
    if (selected.size > 0) setBulkEditOpen(true);
  }, [selected.size]);

  const handleBulkStatusChange = useCallback(
    (status: string) => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      bulkUpdate.mutate({ ids, updates: { status } });
      setSelected(new Set());
      setBulkEditOpen(false);
    },
    [selected, bulkUpdate]
  );

  if (isLoading) {
    return (
      <Card className={cn("card-project-detail", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("card-project-detail", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
              Tickets
            </CardTitle>
            <Button size="sm" className="gap-1" onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              <Button size="sm" variant="outline" className="ml-auto h-7" onClick={handleBulkEdit}>
                Bulk edit
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="py-8 text-center">
              <TicketIcon className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No tickets</p>
              <Button size="sm" className="mt-2" onClick={() => setQuickAddOpen(true)}>
                Add first ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {list.map((ticket) => (
                <div
                  key={ticket.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-colors hover:bg-secondary/50",
                    selected.has(ticket.id) && "ring-1 ring-primary/30"
                  )}
                >
                  <Checkbox
                    checked={selected.has(ticket.id)}
                    onCheckedChange={() => toggleSelect(ticket.id)}
                  />
                  <div className="w-2 h-2 rounded-full shrink-0 bg-teal" aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {ticket.priority}
                      </Badge>
                      {ticket.assigneeName && (
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-secondary">
                            {ticket.assigneeName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuickAddModal
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        projectId={projectId}
        type="ticket"
      />

      <BulkEditModal
        open={bulkEditOpen}
        onOpenChange={(open) => {
          setBulkEditOpen(open);
          if (!open) setSelected(new Set());
        }}
        title="Bulk update tickets"
        fieldLabel="Status"
        options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onApply={handleBulkStatusChange}
        selectedCount={selected.size}
      />
    </>
  );
}
