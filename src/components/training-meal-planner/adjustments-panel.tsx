/**
 * Adjustments & Suggestions Panel — Agent-suggested swaps, portions, rest periods.
 * Accept/Reject workflow with audit trail.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Adjustment } from "@/types/training-plan";

export interface AdjustmentsPanelProps {
  suggestions?: Adjustment[] | null;
  pendingApprovals?: Record<string, "accepted" | "rejected">;
  onAccept?: (adjustmentId: string) => void;
  onReject?: (adjustmentId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  swap_meal: "Swap meal",
  swap_workout: "Swap workout",
  adjust_portion: "Adjust portion",
  modify_rest: "Modify rest",
};

export function AdjustmentsPanel({
  suggestions = [],
  pendingApprovals = {},
  onAccept,
  onReject,
  isLoading,
  className,
}: AdjustmentsPanelProps) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const approvals = pendingApprovals ?? {};

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-40 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bot className="h-5 w-5 text-purple" aria-hidden />
          Agent suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Accept or reject recommended adjustments
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {safeSuggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <Bot className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No suggestions yet</p>
            <p className="text-xs text-muted-foreground">
              Use &quot;Agent-suggest adjustments&quot; in Plan Builder
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {safeSuggestions.map((adj) => {
              const status = approvals[adj.id];
              const isResolved = status === "accepted" || status === "rejected";
              return (
                <li
                  key={adj.id}
                  className={cn(
                    "rounded-lg border border-white/[0.03] bg-secondary/20 p-3 transition-all duration-200",
                    isResolved && "opacity-70"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-purple">
                        {TYPE_LABELS[adj.type] ?? adj.type}
                      </span>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {adj.description ?? "—"}
                      </p>
                      {adj.rationale && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {adj.rationale}
                        </p>
                      )}
                    </div>
                    {!isResolved && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-teal hover:bg-teal/20"
                          onClick={() => onAccept?.(adj.id)}
                          aria-label="Accept"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/20"
                          onClick={() => onReject?.(adj.id)}
                          aria-label="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {isResolved && (
                      <span
                        className={cn(
                          "shrink-0 text-xs font-medium",
                          status === "accepted" ? "text-teal" : "text-muted-foreground"
                        )}
                      >
                        {status === "accepted" ? "Accepted" : "Rejected"}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
