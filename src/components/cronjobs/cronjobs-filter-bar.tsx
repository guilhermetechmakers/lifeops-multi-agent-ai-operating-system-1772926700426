/**
 * CronjobsFilterBar: module, owner, status, tag, triggerType, targetType, automationLevel filters.
 */

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MODULES, OWNERS } from "@/api/cronjobs-mock";
import type { CronjobFilters, TriggerType, TargetType, AutomationLevel } from "@/types/cronjob";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TRIGGER_TYPES: { value: TriggerType | ""; label: string }[] = [
  { value: "", label: "All triggers" },
  { value: "time", label: "Time" },
  { value: "event", label: "Event" },
  { value: "conditional", label: "Conditional" },
];

const TARGET_TYPES: { value: TargetType | ""; label: string }[] = [
  { value: "", label: "All targets" },
  { value: "agent", label: "Agent" },
  { value: "workflow", label: "Workflow" },
];

const AUTOMATION_LEVELS: { value: AutomationLevel | ""; label: string }[] = [
  { value: "", label: "All levels" },
  { value: "suggest-only", label: "Suggest only" },
  { value: "approval-required", label: "Approval required" },
  { value: "auto-execute", label: "Auto execute" },
  { value: "bounded-autopilot", label: "Bounded autopilot" },
];

export interface CronjobsFilterBarProps {
  filters: CronjobFilters;
  search: string;
  onFiltersChange: (f: CronjobFilters) => void;
  onSearchChange: (s: string) => void;
  onClear: () => void;
  className?: string;
}

export function CronjobsFilterBar({
  filters,
  search,
  onFiltersChange,
  onSearchChange,
  onClear,
  className,
}: CronjobsFilterBarProps) {
  const hasActiveFilters =
    filters.module ||
    filters.owner ||
    (filters.status && filters.status !== "all") ||
    filters.tag ||
    (String(filters.triggerType ?? "") !== "") ||
    (String(filters.targetType ?? "") !== "") ||
    (String(filters.automationLevel ?? "") !== "") ||
    search.trim();

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, target, owner, tag..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-input border-white/[0.03]"
          aria-label="Search cronjobs"
        />
      </div>

      <select
        value={filters.module ?? ""}
        onChange={(e) =>
          onFiltersChange({ ...filters, module: e.target.value || undefined })
        }
        className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Filter by module"
      >
        <option value="">All modules</option>
        {(MODULES ?? []).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={filters.owner ?? ""}
        onChange={(e) =>
          onFiltersChange({ ...filters, owner: e.target.value || undefined })
        }
        className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Filter by owner"
      >
        <option value="">All owners</option>
        {(OWNERS ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      <select
        value={filters.status ?? "all"}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            status: (e.target.value as "enabled" | "paused" | "all") || "all",
          })
        }
        className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Filter by status"
      >
        <option value="all">All status</option>
        <option value="enabled">Enabled</option>
        <option value="paused">Paused</option>
      </select>

      <select
        value={filters.triggerType ?? ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            triggerType: (e.target.value as TriggerType | "") || undefined,
          })
        }
        className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Filter by trigger type"
      >
        {(TRIGGER_TYPES ?? []).map(({ value, label }) => (
          <option key={value || "all"} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.targetType ?? ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            targetType: (e.target.value as TargetType | "") || undefined,
          })
        }
        className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Filter by target type"
      >
        {(TARGET_TYPES ?? []).map(({ value, label }) => (
          <option key={value || "all"} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.automationLevel ?? ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            automationLevel: (e.target.value as AutomationLevel | "") || undefined,
          })
        }
        className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Filter by automation level"
      >
        {(AUTOMATION_LEVELS ?? []).map(({ value, label }) => (
          <option key={value || "all"} value={value}>
            {label}
          </option>
        ))}
      </select>

      <Input
        placeholder="Tag"
        value={filters.tag ?? ""}
        onChange={(e) =>
          onFiltersChange({ ...filters, tag: e.target.value || undefined })
        }
        className="w-28 bg-input border-white/[0.03]"
        aria-label="Filter by tag"
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
