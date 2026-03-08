/**
 * HistoryPanel — historical diffs, snapshots, revert actions.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Version } from "@/types/content-editor";

export interface HistoryPanelProps {
  versions: Version[];
  currentVersionId?: string;
  onRevert: (version: Version) => void;
  onSelectVersion?: (version: Version) => void;
  className?: string;
}

export function HistoryPanel({
  versions = [],
  currentVersionId,
  onRevert,
  onSelectVersion,
  className,
}: HistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items = Array.isArray(versions) ? versions : [];
  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Version History
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Snapshots, revert to previous
        </p>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No versions yet
          </p>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {(sorted ?? []).map((v) => {
              const isCurrent = v.id === currentVersionId;
              const isExpanded = expandedId === v.id;
              return (
                <div
                  key={v.id}
                  className={cn(
                    "rounded-lg border border-white/[0.03] bg-secondary/30 transition-all duration-200",
                    isCurrent && "ring-1 ring-primary/40"
                  )}
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() => {
                      setExpandedId(isExpanded ? null : v.id);
                      onSelectVersion?.(v);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {format(parseISO(v.createdAt), "MMM d, HH:mm")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {v.authorName ?? "Unknown"} · {v.changeSummary ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          Current
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevert(v);
                        }}
                        disabled={isCurrent}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Revert
                      </Button>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-white/[0.03] p-3">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-[120px] overflow-y-auto">
                        {v.content.slice(0, 500)}
                        {v.content.length > 500 ? "..." : ""}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
