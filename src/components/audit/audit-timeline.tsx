/**
 * AuditTimeline — immutable, read-only event list with expandable details.
 * Shows actor, type, timestamp, reversible flag; accessible and keyboard-navigable.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, History, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "@/types/audit";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export interface AuditTimelineProps {
  events: AuditEvent[];
  isLoading?: boolean;
  onSelectEvent?: (event: AuditEvent) => void;
  onRevertClick?: (event: AuditEvent) => void;
  className?: string;
}

export function AuditTimeline({
  events,
  isLoading = false,
  onSelectEvent,
  onRevertClick,
  className,
}: AuditTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const list = Array.isArray(events) ? events : [];

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.06] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <History className="h-4 w-4 text-muted-foreground" aria-hidden />
            Audit timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-lg border border-white/[0.06] bg-secondary/20 text-sm text-muted-foreground">
            Loading…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (list.length === 0) {
    return (
      <Card className={cn("border-white/[0.06] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <History className="h-4 w-4 text-muted-foreground" aria-hidden />
            Audit timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg border border-white/[0.06] bg-secondary/20 px-4 py-8 text-center text-sm text-muted-foreground"
            role="status"
          >
            No audit events match the current filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.06] bg-card transition-shadow duration-200 hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <History className="h-4 w-4 text-muted-foreground" aria-hidden />
          Audit timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Expand an event for details; reversible actions can be reverted.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-2">
          <ul className="space-y-1" role="list" aria-label="Audit events">
            {list.map((event) => {
              const isExpanded = expandedId === event.id;
              return (
                <li
                  key={event.id}
                  className={cn(
                    "rounded-lg border border-white/[0.06] bg-secondary/20 transition-colors",
                    isExpanded && "ring-2 ring-primary/30"
                  )}
                >
                  <div className="flex items-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(event.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        toggleExpand(event.id);
                        onSelectEvent?.(event);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(event.id);
                          onSelectEvent?.(event);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Event ${event.action}, ${formatTime(event.timestamp)}`}
                    >
                      <span className="font-medium text-foreground">{event.action}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </span>
                      {event.actorName != null && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          · {event.actorName}
                        </span>
                      )}
                      <span
                        className={cn(
                          "ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                          event.revertible
                            ? "bg-teal/20 text-teal"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {event.revertible && <RotateCcw className="h-3 w-3" />}
                        {event.revertible ? "Reversible" : "—"}
                      </span>
                      <span
                        className={cn(
                          "ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium",
                          event.status === "COMPLETED" && "bg-teal/20 text-teal",
                          event.status === "PENDING" && "bg-amber/20 text-amber",
                          event.status === "FAILED" && "bg-destructive/20 text-destructive",
                          event.status === "REVERTED" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {event.status}
                      </span>
                    </div>
                    {event.revertible && onRevertClick != null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 gap-1 text-amber hover:bg-amber/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevertClick(event);
                        }}
                        aria-label={`Revert ${event.action}`}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Revert
                      </Button>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] px-3 pb-3 pt-2 text-sm">
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                        <dt className="text-muted-foreground">Type</dt>
                        <dd className="font-mono text-foreground">{event.type}</dd>
                        <dt className="text-muted-foreground">Target</dt>
                        <dd className="text-foreground">
                          {event.targetType} {event.targetId ?? ""}
                        </dd>
                        {event.runId != null && (
                          <>
                            <dt className="text-muted-foreground">Run</dt>
                            <dd className="font-mono text-foreground">{event.runId}</dd>
                          </>
                        )}
                        {event.rationale != null && event.rationale !== "" && (
                          <>
                            <dt className="text-muted-foreground">Rationale</dt>
                            <dd className="text-foreground">{event.rationale}</dd>
                          </>
                        )}
                      </dl>
                      {(event.beforeState != null || event.afterState != null || event.diffs != null) && (
                        <div className="mt-2 rounded border border-white/[0.06] bg-background/80 p-2 font-mono text-xs text-muted-foreground">
                          {event.diffs != null && Object.keys(event.diffs).length > 0 && (
                            <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(event.diffs, null, 2)}
                            </pre>
                          )}
                          {event.diffs == null && event.beforeState != null && (
                            <pre className="whitespace-pre-wrap break-all">
                              Before: {JSON.stringify(event.beforeState, null, 2)}
                            </pre>
                          )}
                          {event.diffs == null && event.afterState != null && (
                            <pre className="mt-1 whitespace-pre-wrap break-all">
                              After: {JSON.stringify(event.afterState, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
