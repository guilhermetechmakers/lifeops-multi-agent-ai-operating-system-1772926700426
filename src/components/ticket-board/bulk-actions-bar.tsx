/**
 * BulkActionsBar — bulk status change, assign, tag, convert, PR summary triggers.
 */

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
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

  const count = (selectedTicketIds ?? []).length;
  if (count === 0) return null;

  const handleStatusApply = () => {
    if (status) {
      onBulkApply({ type: "status", payload: { status } });
      setStatus("");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-lg border border-white/[0.03] bg-secondary/50",
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
            className="w-[140px] h-8 border-white/[0.03] bg-card"
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
      <Button size="sm" variant="outline" onClick={() => onBulkApply({ type: "assign" })}>
        Assign
      </Button>
      <Button size="sm" variant="outline" onClick={() => onBulkApply({ type: "tag" })}>
        Add tags
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
  );
}
