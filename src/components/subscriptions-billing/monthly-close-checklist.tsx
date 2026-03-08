/**
 * MonthlyCloseChecklist — Steps for monthly close related to subscriptions and billing.
 * Reconciliations, variances, audit.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, CheckCircle, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonthlyCloseTask, MonthlyCloseStepBilling } from "@/types/finance";

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

function getStatusConfig(status: string) {
  switch (status) {
    case "done":
      return { variant: "success" as const, label: "Done", icon: CheckCircle };
    case "in_progress":
      return { variant: "warning" as const, label: "In progress", icon: Clock };
    default:
      return { variant: "secondary" as const, label: "Open", icon: Circle };
  }
}

export interface MonthlyCloseChecklistProps {
  tasks?: MonthlyCloseTask[];
  /** Alias for tasks — accepts MonthlyCloseStepBilling[] */
  steps?: MonthlyCloseStepBilling[];
  isLoading?: boolean;
  onApprove?: (taskId: string) => void;
  onStart?: (taskId: string) => void;
  className?: string;
}

function toTaskLike(
  s: MonthlyCloseStepBilling
): { id: string; name: string; status: string; dueDate: string } {
  return {
    id: (s as { id?: string }).id ?? `step-${s.name}`,
    name: s.name ?? "",
    status: s.status ?? "open",
    dueDate: s.dueDate ?? "",
  };
}

export function MonthlyCloseChecklist({
  tasks,
  steps,
  isLoading,
  onApprove,
  onStart,
  className,
}: MonthlyCloseChecklistProps) {
  const fromSteps = Array.isArray(steps) ? steps.map(toTaskLike) : [];
  const fromTasks = Array.isArray(tasks) ? tasks : [];
  const items = fromSteps.length > 0 ? fromSteps : fromTasks;
  const subscriptionRelated = items.filter(
    (t) =>
      (t?.name ?? "").toLowerCase().includes("subscription") ||
      (t?.name ?? "").toLowerCase().includes("reconcil") ||
      (t?.name ?? "").toLowerCase().includes("billing") ||
      (t?.name ?? "").toLowerCase().includes("variance")
  );
  const displayItems =
    subscriptionRelated.length > 0 ? subscriptionRelated : items.slice(0, 5);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CheckSquare className="h-5 w-5 text-muted-foreground" aria-hidden />
          Monthly close
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Subscription reconciliations, variances
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-secondary"
                aria-hidden
              />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="py-8 text-center">
            <CheckSquare
              className="mx-auto h-10 w-10 text-muted-foreground mb-4"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              No subscription close tasks
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((t) => {
              const badge = getStatusConfig((t as { status?: string }).status ?? "open");
              const Icon = badge.icon;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
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
                    {(t as { status?: string }).status !== "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() =>
                          (t as { status?: string }).status === "in_progress"
                            ? onApprove?.(t.id)
                            : onStart?.(t.id)
                        }
                      >
                        {(t as { status?: string }).status === "in_progress" ? "Approve" : "Start"}
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
