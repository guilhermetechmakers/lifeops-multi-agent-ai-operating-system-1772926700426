/**
 * DraftsPanel — Kanban-like view of drafts with stages, or dense DraftListView with version, last updated, status.
 */

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, FileEdit, User, List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useContentItems,
  useAdvanceContentStage,
} from "@/hooks/use-content-dashboard";
import type { ContentItem, ContentFilters, ContentStatus } from "@/types/content-dashboard";

export type DraftsViewMode = "stages" | "list";

const STAGES: { id: ContentStatus; label: string }[] = [
  { id: "idea", label: "Idea" },
  { id: "research", label: "Research" },
  { id: "draft", label: "Draft" },
  { id: "edit", label: "Edit" },
  { id: "ready-to-publish", label: "Ready" },
];

export interface DraftsPanelProps {
  search?: string;
  filters?: ContentFilters | { statuses?: ContentStatus[]; projectIds?: string[] };
  onOpenEditor?: (item: ContentItem) => void;
  className?: string;
}

export function DraftsPanel({
  search = "",
  filters = {},
  onOpenEditor,
  className,
}: DraftsPanelProps) {
  const [viewMode, setViewMode] = useState<DraftsViewMode>("stages");
  const { data, isLoading } = useContentItems({
    search: search || undefined,
    filters: (filters && (filters.statuses?.length || filters.projectIds?.length))
      ? { statuses: filters.statuses, projectIds: filters.projectIds }
      : undefined,
    limit: 100,
  });
  const advanceStage = useAdvanceContentStage();

  const items = Array.isArray(data?.items) ? data.items : [];
  const draftItems = items.filter(
    (i) =>
      i.status !== "published" &&
      ["idea", "research", "draft", "edit", "ready-to-publish"].includes(i.status)
  );

  const byStage = useMemo(() => {
    const map: Record<ContentStatus, ContentItem[]> = {
      idea: [],
      research: [],
      draft: [],
      edit: [],
      "ready-to-publish": [],
      published: [],
    };
    (draftItems ?? []).forEach((i) => {
      if (map[i.status]) map[i.status].push(i);
    });
    return map;
  }, [draftItems]);

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-48 w-56 shrink-0 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedForList = useMemo(
    () =>
      [...draftItems].sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime()
      ),
    [draftItems]
  );

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-amber" />
              Drafts
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Advance stages, reassign, request approvals
            </p>
          </div>
          <div className="flex rounded-md border border-white/[0.03] p-0.5">
            <Button
              variant={viewMode === "stages" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => setViewMode("stages")}
              aria-label="Stages view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Stages
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
              List
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "list" ? (
          <div className="space-y-1 max-h-[320px] overflow-y-auto">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-white/[0.03] sticky top-0 bg-card">
              <span>Title</span>
              <span className="text-right">Version</span>
              <span className="text-right">Updated</span>
              <span className="text-right w-24">Status</span>
            </div>
            {(sortedForList ?? []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-lg border border-white/[0.03] bg-secondary/20 px-3 py-2 transition-all duration-200 hover:bg-secondary/40 hover:shadow-card-hover"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs shrink-0"
                    onClick={() => onOpenEditor?.(item)}
                  >
                    Open
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  v{item.version ?? 1}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.updatedAt
                    ? format(parseISO(item.updatedAt), "MMM d, HH:mm")
                    : "—"}
                </span>
                <span className="text-[10px] font-medium capitalize text-muted-foreground w-24 truncate text-right">
                  {item.status?.replace(/-/g, " ") ?? "—"}
                </span>
              </div>
            ))}
            {sortedForList.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No drafts in progress
              </p>
            )}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 min-h-[200px]">
            {STAGES.filter((s) => s.id !== "published").map((stage) => {
              const stageItems = byStage[stage.id] ?? [];
              return (
                <div
                  key={stage.id}
                  className="shrink-0 w-56 rounded-lg border border-white/[0.03] bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {stage.label}
                    </span>
                    <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {stageItems.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(stageItems ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-white/[0.03] bg-card p-3 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
                      >
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0" />
                          {item.authorName ?? "Author"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => onOpenEditor?.(item)}
                          >
                            Open
                          </Button>
                          {stage.id !== "ready-to-publish" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => advanceStage.mutate(item.id)}
                              disabled={advanceStage.isPending}
                            >
                              <ChevronRight className="h-3 w-3" />
                              Advance
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
