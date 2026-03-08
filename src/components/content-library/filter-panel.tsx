/**
 * FilterPanel — collapsible filters: tags, channel, owner, status, date range, search, clear all.
 */

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentLibraryFilters } from "@/types/content-library";

export interface FilterPanelProps {
  filters: ContentLibraryFilters;
  onChange: (filters: ContentLibraryFilters) => void;
  onFiltersChange?: (filters: ContentLibraryFilters) => void;
  owners: string[];
  channels: string[];
  tags: string[];
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const SCOPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "assets", label: "Assets" },
  { value: "published", label: "Published" },
];

export function FilterPanel({
  filters,
  onChange,
  onFiltersChange,
  owners = [],
  channels = [],
  tags: _tags = [],
  searchValue,
  searchPlaceholder: _searchPlaceholder = "Search...",
  onSearchChange,
  className,
}: FilterPanelProps) {
  const handleChange = onFiltersChange ?? onChange;
  const [open, setOpen] = useState(true);
  const [localSearch, setLocalSearch] = useState("");

  const search = searchValue ?? localSearch;
  const setSearch = useCallback(
    (v: string) => {
      if (onSearchChange) onSearchChange(v);
      else setLocalSearch(v);
    },
    [onSearchChange]
  );

  const handleReset = useCallback(() => {
    setSearch("");
    handleChange({});
  }, [handleChange, setSearch]);

  const hasActiveFilters =
    Boolean(filters?.status) ||
    filters?.channel ||
    filters?.owner ||
    filters?.dateFrom ||
    filters?.dateTo ||
    (Array.isArray(filters?.tags) && filters.tags.length > 0) ||
    (filters?.scope && filters.scope !== "all");

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
            aria-label="Search content"
          />
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                •
              </span>
            )}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-muted-foreground"
            onClick={handleReset}
            aria-label="Clear all filters"
          >
            <RotateCcw className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>
      <CollapsibleContent>
        <div
          className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.03]"
          role="search"
          aria-label="Content filters"
        >
          <Select
            value={filters?.scope ?? "all"}
            onValueChange={(v) =>
              handleChange({ ...filters, scope: v === "all" ? undefined : (v as "assets" | "published") })
            }
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters?.status ?? ""}
            onValueChange={(v) => handleChange({ ...filters, status: v as ContentLibraryFilters["status"] })}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value || "all"} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters?.channel ?? ""}
            onValueChange={(v) => handleChange({ ...filters, channel: v || undefined })}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All channels</SelectItem>
              {(channels ?? []).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters?.owner ?? ""}
            onValueChange={(v) => handleChange({ ...filters, owner: v || undefined })}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All owners</SelectItem>
              {(owners ?? []).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filters?.dateFrom ?? ""}
            onChange={(e) => handleChange({ ...filters, dateFrom: e.target.value || undefined })}
            className="w-[140px] h-9"
            aria-label="Date from"
          />
          <Input
            type="date"
            value={filters?.dateTo ?? ""}
            onChange={(e) => handleChange({ ...filters, dateTo: e.target.value || undefined })}
            className="w-[140px] h-9"
            aria-label="Date to"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
