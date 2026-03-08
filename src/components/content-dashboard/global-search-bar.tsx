/**
 * GlobalSearchBar — search input with multi-field facets and per-module scopes.
 */

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SearchScope = "all" | "content" | "projects" | "cronjobs" | "runs" | "users";

const SCOPE_OPTIONS: { value: SearchScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "content", label: "Content" },
  { value: "projects", label: "Projects" },
  { value: "cronjobs", label: "Cronjobs" },
  { value: "runs", label: "Runs" },
  { value: "users", label: "Users" },
];

export interface GlobalSearchBarProps {
  value?: string;
  search?: string;
  onChange?: (q: string) => void;
  onSearch?: (q: string) => void;
  scope?: SearchScope;
  onScopeChange?: (scope: SearchScope) => void;
  className?: string;
}

export function GlobalSearchBar({
  value,
  search,
  onChange,
  onSearch,
  scope = "all",
  onScopeChange,
  className,
}: GlobalSearchBarProps) {
  const q = value ?? search ?? "";
  const setQ = onChange ?? onSearch ?? (() => {});
  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <Select value={scope} onValueChange={(v) => onScopeChange?.(v as SearchScope)}>
        <SelectTrigger
          className="w-[120px] h-10 shrink-0 bg-secondary border-white/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search scope"
        >
          <SelectValue placeholder="Scope" />
        </SelectTrigger>
        <SelectContent>
          {(SCOPE_OPTIONS ?? []).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1 min-w-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search projects, content, cronjobs, runs, users..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 pr-4 h-10 bg-secondary border-white/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Global search"
        />
      </div>
    </div>
  );
}
