/**
 * BulkActionsBar — bulk status change, assign, tag, convert, PR summary triggers.
 */

import { useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "ready", label: "Ready" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export type BulkActionType =
  | "status"
  | "assign"
  | "tag"
  | "priority"
  | "snooze"
  | "convert"
  | "pr_summary";

export interface BulkAction {
  type: BulkActionType;
  payload?: Record<string, unknown>;
}

export interface BulkActionsBarProps {
  selectedTicketIds: string[];
  onBulkApply: (action: BulkAction) => void;
  onClear: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedTicketIds,
  onBulkApply,
  onClear,
  className,
}: BulkActionsBarProps) {
  const [status, setStatus] = useState<string>("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [snoozeDays, setSnoozeDays] = useState<number>(1);

  const count = (selectedTicketIds ?? []).length;
  if (count === 0) return null;

  const handleStatusApply = useCallback(() => {
    if (status) {
      onBulkApply({ type: "status", payload: { status } });
      setStatus("");
    }
  }, [status, onBulkApply]);

  const handleAssignSubmit = useCallback(() => {
    const id = assigneeId.trim();
    if (id) {
      onBulkApply({ type: "assign", payload: { assigneeId: id } });
      setAssigneeId("");
      setAssignOpen(false);
    }
  }, [assigneeId, onBulkApply]);

  const handleTagSubmit = useCallback(() => {
    const labels = tagInput
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (labels.length > 0) {
      onBulkApply({ type: "tag", payload: { labels } });
      setTagInput("");
      setTagOpen(false);
    }
  }, [tagInput, onBulkApply]);

  const handleSnoozeSubmit = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() + snoozeDays);
    onBulkApply({ type: "snooze", payload: { snoozedUntil: d.toISOString() } });
    setSnoozeOpen(false);
  }, [snoozeDays, onBulkApply]);

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl border border-[rgb(255_255_255/0.03)] bg-secondary/50 shadow-card transition-all duration-200",
          className
        )}
      >
        <span className="text-sm font-medium text-foreground">
          {count} selected
        </span>
        <div className="flex items-center gap-2">
          <Label htmlFor="bulk-status" className="text-xs text-muted-foreground">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              id="bulk-status"
              className="w-[140px] h-8 border-[rgb(255_255_255/0.03)] bg-card"
            >
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleStatusApply}
            disabled={!status}
          >
            Apply
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAssignOpen(true)}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          Assign
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTagOpen(true)}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          Add tags
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSnoozeOpen(true)}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          SNOOZE
        </Button>
        <Button size="sm" variant="outline" onClick={() => onBulkApply({ type: "convert" })}>
          Convert to tasks
        </Button>
        <Button size="sm" variant="outline" onClick={() => onBulkApply({ type: "pr_summary" })}>
          Run PR summary
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          className="ml-auto"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="border-[rgb(255_255_255/0.03)] bg-card">
          <DialogHeader>
            <DialogTitle>Bulk assign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="bulk-assignee">Assignee ID or name</Label>
            <Input
              id="bulk-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="e.g. user-123 or Alex"
              className="border-[rgb(255_255_255/0.03)] bg-secondary/30"
              onKeyDown={(e) => e.key === "Enter" && handleAssignSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit} disabled={!assigneeId.trim()}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagOpen} onOpenChange={setTagOpen}>
        <DialogContent className="border-[rgb(255_255_255/0.03)] bg-card">
          <DialogHeader>
            <DialogTitle>Add tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="bulk-tags">Labels (comma or semicolon separated)</Label>
            <Input
              id="bulk-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. bug, urgent, backend"
              className="border-[rgb(255_255_255/0.03)] bg-secondary/30"
              onKeyDown={(e) => e.key === "Enter" && handleTagSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTagOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTagSubmit}
              disabled={
                !tagInput
                  .split(/[,;]/)
                  .map((s) => s.trim())
                  .filter(Boolean).length
              }
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={snoozeOpen} onOpenChange={setSnoozeOpen}>
        <DialogContent className="border-[rgb(255_255_255/0.03)] bg-card">
          <DialogHeader>
            <DialogTitle>SNOOZE tickets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="bulk-snooze">Snooze for (days)</Label>
            <Input
              id="bulk-snooze"
              type="number"
              min={1}
              max={30}
              value={snoozeDays}
              onChange={(e) => setSnoozeDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="border-[rgb(255_255_255/0.03)] bg-secondary/30"
              onKeyDown={(e) => e.key === "Enter" && handleSnoozeSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSnoozeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSnoozeSubmit}>
              Snooze {count} ticket{count !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
