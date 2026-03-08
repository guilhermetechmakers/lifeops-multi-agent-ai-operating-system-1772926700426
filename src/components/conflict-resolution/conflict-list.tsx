/**
 * ConflictList — Compact, searchable list of conflicts with per-item actions.
 * Resolve, override, inspect.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Conflict } from "@/types/conflicts";

export interface ConflictListProps {
  conflicts: Conflict[];
  onResolve?: (conflict: Conflict) => void;
  onOverride?: (conflict: Conflict) => void;
  onInspect?: (conflict: Conflict) => void;
  onResolveAll?: () => void;
  isResolving?: boolean;
  className?: string;
}

export function ConflictList({
  conflicts,
  onResolve,
  onOverride,
  onInspect,
  onResolveAll,
  isResolving = false,
  className,
}: ConflictListProps) {
  const [search, setSearch] = useState("");
  const safeConflicts = Array.isArray(conflicts) ? conflicts : [];

  const filtered = useMemo(() => {
    const q = (search ?? "").trim().toLowerCase();
    if (!q) return safeConflicts;
    return safeConflicts.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        (c.agents ?? []).some(
          (a) =>
            a.id?.toLowerCase().includes(q) ||
            a.role?.toLowerCase().includes(q)
        )
    );
  }, [safeConflicts, search]);

  const openCount = safeConflicts.filter((c) => c.status === "open").length;

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all duration-200",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Conflicts</CardTitle>
        <div className="flex items-center gap-2">
          {onResolveAll && openCount > 0 && (
            <Button
              size="sm"
              onClick={onResolveAll}
              disabled={isResolving}
              className="gap-2"
            >
              {isResolving ? "Resolving…" : "Resolve all"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, agent, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
            aria-label="Search conflicts"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-white/[0.06] bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
            {safeConflicts.length === 0
              ? "No conflicts. Create or import conflicts to resolve."
              : "No matching conflicts."}
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-md border border-white/[0.06] bg-secondary/20 p-3 transition-colors duration-120 hover:bg-secondary/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{c.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {(c.agents ?? []).map((a) => `${a.role} (${a.id})`).join(" ↔ ")}
                  </p>
                </div>
                <Badge
                  variant={
                    c.status === "open"
                      ? "destructive"
                      : c.status === "resolved"
                        ? "default"
                        : "secondary"
                  }
                  className="shrink-0"
                >
                  {c.status}
                </Badge>
                <div className="flex items-center gap-1 shrink-0">
                  {onResolve && c.status === "open" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onResolve(c)}
                      disabled={isResolving}
                      aria-label={`Resolve ${c.id}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Actions for ${c.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onInspect && (
                        <DropdownMenuItem onClick={() => onInspect(c)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Inspect
                        </DropdownMenuItem>
                      )}
                      {onOverride && (
                        <DropdownMenuItem onClick={() => onOverride(c)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Override
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
