/**
 * DraftsPanel — Kanban-like view of drafts with stages: idea, research, draft, edit, ready to publish.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, FileEdit, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useContentItems,
  useAdvanceContentStage,
} from "@/hooks/use-content-dashboard";
import type { ContentItem, ContentFilters, ContentStatus } from "@/types/content-dashboard";

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
  const { data, isLoading } = useContentItems({
    search: search || undefined,
    filters: (filters && (filters.statuses?.length || filters.projectIds?.length))
      ? { statuses: filters.statuses, projectIds: filters.projectIds }
      : undefined,
    limit: 100,
  });
  const advanceStage = useAdvanceContentStage();

  const items = data?.items ?? [];
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

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileEdit className="h-5 w-5 text-amber" />
          Drafts
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Advance stages, reassign, request approvals
        </p>
      </CardHeader>
      <CardContent>
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
                        <User className="h-3 w-3" />
                        Author
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
      </CardContent>
    </Card>
  );
}
