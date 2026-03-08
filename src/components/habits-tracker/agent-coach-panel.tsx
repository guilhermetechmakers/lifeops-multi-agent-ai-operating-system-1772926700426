/**
 * AgentCoachPanel — Nudges, micro-actions, adaptive schedule suggestions.
 * Props: context data (habits, calendar events, health signals).
 * Outputs: list of nudges/micro-actions/adaptive suggestions; approve or dismiss.
 * All array operations guarded.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";
import { useCoachingContext, useCoachingActions } from "@/hooks/use-habits-tracker";
import type { CoachingAction } from "@/types/health";
import { cn } from "@/lib/utils";

export interface AgentCoachPanelProps {
  habitId?: string;
  onActionResolved?: (actionId: string, approved: boolean) => void;
  className?: string;
  /** When provided, use these instead of useCoachingContext (e.g. from HabitBoard). */
  nudges?: CoachingAction[];
  microActions?: CoachingAction[];
  adaptiveSuggestions?: Array<{ description: string; actionId: string }>;
  onApprove?: (actionId: string) => void;
  onDismiss?: (actionId: string) => void;
  isLoading?: boolean;
}

function ActionItem({
  action,
  onApprove,
  onDismiss,
}: {
  action: CoachingAction;
  onApprove: () => void;
  onDismiss: () => void;
}) {
  const isPending = action?.status === "pending";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-md border border-white/[0.03] bg-secondary/20 p-3 transition-colors",
        !isPending && "opacity-70"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{action?.message ?? "Coaching suggestion"}</p>
        <span className="mt-1 inline-block text-xs text-muted-foreground">
          {action?.type ?? "nudge"}
        </span>
      </div>
      {isPending && (
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-teal"
            onClick={onApprove}
            aria-label="Apply suggestion"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function AgentCoachPanel({
  habitId,
  onActionResolved,
  className,
  nudges: nudgesProp,
  microActions: microActionsProp,
  adaptiveSuggestions: adaptiveSuggestionsProp,
  onApprove,
  onDismiss,
  isLoading: isLoadingProp,
}: AgentCoachPanelProps) {
  const context = useCoachingContext(habitId);
  const recordAction = useCoachingActions();

  const nudges = nudgesProp ?? context.nudges;
  const microActions = microActionsProp ?? context.microActions;
  const adaptiveSuggestions = adaptiveSuggestionsProp ?? context.adaptiveSuggestions;
  const isLoading = isLoadingProp ?? context.isLoading;

  const pendingNudges = (nudges ?? []).filter((n) => n?.status === "pending") as CoachingAction[];
  const pendingMicro = (microActions ?? []).filter((m) => m?.status === "pending") as CoachingAction[];
  const suggestions = (adaptiveSuggestions ?? []).map((s) => ({
    ...s,
    id: s?.actionId ?? "",
    message: s?.description ?? "",
    type: "adaptive-schedule" as const,
    status: "pending" as const,
    habitId: habitId ?? "",
    createdAt: new Date().toISOString(),
  }));

  const allPending = [
    ...pendingNudges,
    ...pendingMicro,
    ...suggestions,
  ].filter(Boolean);

  const handleApprove = (actionId: string) => {
    if (onApprove) onApprove(actionId);
    else recordAction.mutate({ actionId, approved: true });
    onActionResolved?.(actionId, true);
  };

  const handleDismiss = (actionId: string) => {
    if (onDismiss) onDismiss(actionId);
    else recordAction.mutate({ actionId, approved: false });
    onActionResolved?.(actionId, false);
  };

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <div className="h-5 w-36 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-amber" />
          Agent coaching
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Nudges and suggestions based on your habits and calendar.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {allPending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending suggestions. Keep up the good work!
          </p>
        ) : (
          (allPending as Array<CoachingAction & { message?: string }>).map((action) => (
            <ActionItem
              key={action?.id ?? ""}
              action={action}
              onApprove={() => handleApprove(action?.id ?? "")}
              onDismiss={() => handleDismiss(action?.id ?? "")}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
