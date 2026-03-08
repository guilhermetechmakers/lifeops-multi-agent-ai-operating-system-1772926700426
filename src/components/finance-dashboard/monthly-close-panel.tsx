/**
 * MonthlyClosePanel — Checklists, reconciliations, auto-generated tasks.
 * Approval queue integration and audit trails.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonthlyCloseTask } from "@/types/finance";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "done":
      return { variant: "success" as const, label: "Done", icon: CheckCircle };
    case "in_progress":
      return { variant: "warning" as const, label: "In progress", icon: Clock };
    default:
      return { variant: "secondary" as const, label: "Open", icon: CheckSquare };
  }
}

interface MonthlyClosePanelProps {
  tasks: MonthlyCloseTask[];
  isLoading?: boolean;
  onApprove?: (taskId: string) => void;
  className?: string;
}

export function MonthlyClosePanel({
  tasks,
  isLoading,
  onApprove,
  className,
}: MonthlyClosePanelProps) {
  const items = Array.isArray(tasks) ? tasks : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CheckSquare className="h-5 w-5" />
          Monthly Close
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Reconciliations, approvals, audit trails
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <CheckSquare className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No monthly close tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((t) => {
              const badge = getStatusBadge(t.status ?? "open");
              const Icon = badge.icon;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDate(t.dueDate ?? "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={badge.variant} className="text-[10px]">
                      {badge.label}
                    </Badge>
                    {t.status !== "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => onApprove?.(t.id)}
                      >
                        Approve
                      </Button>
                    )}
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
