/**
 * GlobalSearchBar — search input with multi-field facets and per-module scopes.
 */

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchScope = "all" | "content" | "projects" | "cronjobs" | "runs" | "users";

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
  className,
}: GlobalSearchBarProps) {
  const q = value ?? search ?? "";
  const setQ = onChange ?? onSearch ?? (() => {});
  return (
    <div className={cn("relative", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
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
  );
}
