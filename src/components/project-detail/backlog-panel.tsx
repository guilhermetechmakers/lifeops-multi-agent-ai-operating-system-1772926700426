/**
 * BacklogPanel — list with search, filters, add-new task input, bulk select.
 */

import { useMemo, useState, useCallback } from "react";
import { ListTodo, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectBacklog, useBulkUpdateBacklog } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { BacklogItem, BacklogStatus } from "@/types/projects";
import { QuickAddModal } from "./quick-add-modal";
import { BulkEditModal } from "./bulk-edit-modal";

export interface BacklogPanelProps {
  projectId: string;
  className?: string;
}

const STATUS_OPTIONS: BacklogStatus[] = ["New", "In Progress", "Blocked", "Done"];

export function BacklogPanel({ projectId, className }: BacklogPanelProps) {
  const { items: backlog, isLoading } = useProjectBacklog(projectId);
  const bulkUpdate = useBulkUpdateBacklog(projectId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BacklogStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const list = backlog ?? [];

  const filtered = useMemo(() => {
    let out = list;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.description ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      out = out.filter((b) => b.status === statusFilter);
    }
    return out;
  }, [list, search, statusFilter]);

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
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-project-detail", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            Backlog
          </CardTitle>
          <Button size="sm" className="gap-1.5" onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search backlog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 border-white/[0.03]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BacklogStatus | "all")}
            className="h-9 rounded-md border border-white/[0.03] bg-input px-3 text-sm text-foreground"
          >
            <option value="all">All status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={handleBulkEdit}>
              Bulk edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <ListTodo className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {list.length === 0 ? "No backlog items yet" : "No items match your filters"}
            </p>
            {list.length === 0 && (
              <Button size="sm" className="mt-2" onClick={() => setQuickAddOpen(true)}>
                Add first item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {filtered.map((item) => (
              <BacklogRow
                key={item.id}
                item={item}
                selected={selected.has(item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
                showCheckbox={selected.size > 0 || true}
              />
            ))}
          </div>
        )}
      </CardContent>
      <QuickAddModal
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        projectId={projectId}
        type="backlog"
      />
      <BulkEditModal
        open={bulkEditOpen}
        onOpenChange={(open) => {
          setBulkEditOpen(open);
          if (!open) setSelected(new Set());
        }}
        title="Bulk update backlog"
        fieldLabel="Status"
        options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
        onApply={handleBulkStatusChange}
        selectedCount={selected.size}
      />
    </Card>
  );
}

function BacklogRow({
  item,
  selected,
  onToggleSelect,
  showCheckbox,
}: {
  item: BacklogItem;
  selected: boolean;
  onToggleSelect: () => void;
  showCheckbox: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-white/[0.03] px-3 py-2",
        "bg-secondary/30 hover:bg-secondary/50 transition-colors"
      )}
    >
      {showCheckbox && (
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {item.status}
          </Badge>
          <span className="text-xs text-muted-foreground">{item.priority}</span>
          {item.assigneeName && (
            <span className="text-xs text-muted-foreground">• {item.assigneeName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
