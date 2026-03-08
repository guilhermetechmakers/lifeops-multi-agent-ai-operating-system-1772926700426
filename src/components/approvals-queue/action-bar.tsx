/**
 * Action bar: Approve, Approve with Conditions, Reject, Request Changes, Escalate, Revert.
 */

import { Check, X, FileEdit, RotateCcw, CheckSquare, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionBarProps {
  status: string;
  onApprove: () => void;
  onApproveWithConditions: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  onEscalate?: () => void;
  onRevert?: () => void;
  isPending?: boolean;
  canRevert?: boolean;
  runId?: string;
  runDetailsUrl?: string;
  className?: string;
}

export function ActionBar({
  status,
  onApprove,
  onApproveWithConditions,
  onReject,
  onRequestChanges,
  onEscalate,
  onRevert,
  isPending = false,
  canRevert = false,
  runId,
  runDetailsUrl,
  className,
}: ActionBarProps) {
  const isActionable =
    status === "queued" || status === "pending" || status === "conditional";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.03] bg-card p-4",
        className
      )}
      role="group"
      aria-label="Approval actions"
    >
      {isActionable && (
        <>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90"
            aria-label="Approve"
          >
            <Check className="mr-1.5 h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onApproveWithConditions}
            disabled={isPending}
            aria-label="Approve with conditions"
          >
            <CheckSquare className="mr-1.5 h-4 w-4" />
            Approve with conditions
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/50 hover:bg-destructive/10"
            onClick={onReject}
            disabled={isPending}
            aria-label="Reject"
          >
            <X className="mr-1.5 h-4 w-4" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRequestChanges}
            disabled={isPending}
            aria-label="Request changes"
          >
            <FileEdit className="mr-1.5 h-4 w-4" />
            Request changes
          </Button>
          {onEscalate && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEscalate}
              disabled={isPending}
              aria-label="Escalate to next approver"
            >
              <ArrowUpCircle className="mr-1.5 h-4 w-4" />
              Escalate
            </Button>
          )}
        </>
      )}
      {canRevert && onRevert && (status === "approved" || status === "conditional") && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRevert}
          disabled={isPending}
          aria-label="Revert approval"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Revert
        </Button>
      )}
      {runId && runDetailsUrl && (
        <Button size="sm" variant="ghost" asChild>
          <a href={runDetailsUrl} className="text-muted-foreground">
            View run details
          </a>
        </Button>
      )}
    </div>
  );
}
