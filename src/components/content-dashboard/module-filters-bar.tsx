/**
 * ModuleFiltersBar — facets for projects, content types, status, date ranges, authors, tags.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentFilters, ContentStatus } from "@/types/content-dashboard";

export type ContentFiltersState = ContentFilters;

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "research", label: "Research" },
  { value: "draft", label: "Draft" },
  { value: "edit", label: "Edit" },
  { value: "ready-to-publish", label: "Ready to publish" },
  { value: "published", label: "Published" },
];

export interface ModuleFiltersBarProps {
  filters: ContentFilters | ContentFiltersState;
  onFiltersChange: (f: ContentFilters | ContentFiltersState) => void;
  projectOptions?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  className?: string;
}

export function ModuleFiltersBar({
  filters,
  onFiltersChange,
  projectOptions = [],
  projects = [],
  className,
}: ModuleFiltersBarProps) {
  const projectList = (projects ?? []).length > 0 ? projects : projectOptions;
  const statuses = filters.statuses ?? [];
  const hasFilters = statuses.length > 0 || (filters.dateFrom ?? filters.dateTo);

  const toggleStatus = (s: ContentStatus) => {
    const next = statuses.includes(s)
      ? statuses.filter((x) => x !== s)
      : [...statuses, s];
    onFiltersChange({ ...filters, statuses: next });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground font-medium">Status:</span>
      {STATUS_OPTIONS.map((opt) => (
        <Badge
          key={opt.value}
          variant={statuses.includes(opt.value) ? "default" : "secondary"}
          className={cn(
            "cursor-pointer transition-all duration-120 hover:scale-[1.02]",
            statuses.includes(opt.value) && "bg-primary/20 text-primary border-primary/30"
          )}
          onClick={() => toggleStatus(opt.value)}
        >
          {opt.label}
        </Badge>
      ))}
      {projectList.length > 0 && (
        <Select
          value={filters.projectIds?.[0] ?? "all"}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              projectIds: v === "all" ? [] : [v],
            })
          }
        >
          <SelectTrigger className="w-[180px] h-8 border-white/[0.03] bg-secondary">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {(projectList ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-muted-foreground hover:text-foreground"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
