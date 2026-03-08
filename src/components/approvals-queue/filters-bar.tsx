/**
 * Filters bar for Approvals Queue. Multi-select and search; filters synced to URL.
 */

import { useId } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ApprovalQueueFilters,
  ApprovalQueueStatus,
  ApprovalSeverity,
  ApprovalPriority,
} from "@/types/approvals";

export interface FiltersBarProps {
  filters: ApprovalQueueFilters;
  onFiltersChange: (updates: Partial<ApprovalQueueFilters>) => void;
  className?: string;
}

const SEVERITIES: ApprovalSeverity[] = ["low", "medium", "high", "critical"];
const PRIORITIES: ApprovalPriority[] = ["low", "medium", "high", "critical"];
const STATUSES: ApprovalQueueStatus[] = [
  "queued",
  "pending",
  "approved",
  "rejected",
  "conditional",
  "escalated",
];
const SLA_URGENCIES: Array<{ value: ApprovalQueueFilters["slaUrgency"]; label: string }> = [
  { value: "all", label: "All SLA" },
  { value: "overdue", label: "Overdue" },
  { value: "expiring", label: "Expiring soon" },
  { value: "ok", label: "OK" },
];

export function FiltersBar({ filters, onFiltersChange, className }: FiltersBarProps) {
  const searchId = useId();
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.03] bg-card p-4",
        className
      )}
      role="search"
      aria-label="Filter approvals"
    >
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={searchId}
          type="search"
          placeholder="Search by cron, owner, rationale..."
          value={filters.search ?? ""}
          onChange={(e) => onFiltersChange({ search: e.target.value || undefined, page: 1 })}
          className="pl-9 bg-secondary/50 border-white/[0.03]"
          aria-label="Search approvals"
        />
      </div>
      <Select
        value={filters.severity ? String(filters.severity) : "all"}
        onValueChange={(v) =>
          onFiltersChange({
            severity: v === "all" ? undefined : (v as ApprovalSeverity),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[130px] bg-secondary/50 border-white/[0.03]">
          <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All severity</SelectItem>
          {SEVERITIES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status ? String(filters.status) : "all"}
        onValueChange={(v) =>
          onFiltersChange({
            status: v === "all" ? undefined : (v as ApprovalQueueStatus),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[130px] bg-secondary/50 border-white/[0.03]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.priority ? String(filters.priority) : "all"}
        onValueChange={(v) =>
          onFiltersChange({
            priority: v === "all" ? undefined : (v as ApprovalPriority),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[130px] bg-secondary/50 border-white/[0.03]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priority</SelectItem>
          {PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.slaUrgency ?? "all"}
        onValueChange={(v) =>
          onFiltersChange({
            slaUrgency: v === "all" ? undefined : (v as ApprovalQueueFilters["slaUrgency"]),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[140px] bg-secondary/50 border-white/[0.03]">
          <SelectValue placeholder="SLA urgency" />
        </SelectTrigger>
        <SelectContent>
          {SLA_URGENCIES.map(({ value, label }) => (
            <SelectItem key={value ?? "all"} value={value ?? "all"}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Assigned approver"
        value={filters.assignedApprover ?? ""}
        onChange={(e) =>
          onFiltersChange({ assignedApprover: e.target.value || undefined, page: 1 })
        }
        className="w-[140px] bg-secondary/50 border-white/[0.03]"
        aria-label="Filter by assigned approver"
      />
      {(filters.search ??
        filters.severity ??
        filters.status ??
        filters.priority ??
        filters.slaUrgency ??
        filters.assignedApprover) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFiltersChange({
              search: undefined,
              severity: undefined,
              status: undefined,
              priority: undefined,
              slaUrgency: undefined,
              assignedApprover: undefined,
              page: 1,
            })
          }
          className="text-muted-foreground"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
