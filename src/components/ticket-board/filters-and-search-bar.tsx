/**
 * FiltersAndSearchBar — filter tickets by assignee, labels, priority, status, sprint, search.
 */

import { useCallback, useState } from "react";
import { Search, Filter, X } from "lucide-react";
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
import type { TicketFilters } from "@/api/ticket-board";
import type { Sprint } from "@/types/projects";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export interface FiltersAndSearchBarProps {
  filters: TicketFilters;
  onFiltersChange: (f: TicketFilters) => void;
  sprints?: Sprint[];
  className?: string;
}

export function FiltersAndSearchBar({
  filters,
  onFiltersChange,
  sprints = [],
  className,
}: FiltersAndSearchBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const sprintList = Array.isArray(sprints) ? sprints : [];

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      onFiltersChange({ ...filters, search: value || undefined });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    setSearchValue("");
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters =
    (filters.search ?? "").length > 0 ||
    ((filters.status ?? "") !== "" && (filters.status ?? "") !== "all") ||
    ((filters.priority ?? "") !== "" && (filters.priority ?? "") !== "all") ||
    (filters.sprintId ?? "").length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 border-white/[0.03] bg-secondary/30"
            aria-label="Search tickets"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5"
          aria-expanded={showFilters}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-muted-foreground"
            aria-label="Clear filters"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 rounded-lg border border-white/[0.03] bg-secondary/20 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) =>
                onFiltersChange({
                  ...filters,
                  status: v && v !== "all" ? v : undefined,
                })
              }
            >
              <SelectTrigger className="w-36 h-8 border-white/[0.03]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority</span>
            <Select
              value={filters.priority ?? "all"}
              onValueChange={(v) =>
                onFiltersChange({
                  ...filters,
                  priority: v && v !== "all" ? v : undefined,
                })
              }
            >
              <SelectTrigger className="w-36 h-8 border-white/[0.03]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sprint</span>
            <Select
              value={filters.sprintId ?? "all"}
              onValueChange={(v) =>
                onFiltersChange({
                  ...filters,
                  sprintId: v && v !== "all" ? v : undefined,
                })
              }
            >
              <SelectTrigger className="w-40 h-8 border-white/[0.03]">
                <SelectValue placeholder="All sprints" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sprints</SelectItem>
                {sprintList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
