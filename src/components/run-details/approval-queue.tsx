/**
 * ApprovalQueue — list of actions requiring human approval with context.
 * Used when run is paused at governance points.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ApprovalItem {
  id: string;
  actionType: string;
  agentId?: string;
  context?: Record<string, unknown>;
  requestedAt: string;
  expiresAt?: string;
}

export interface ApprovalQueueProps {
  items: ApprovalItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  className?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export function ApprovalQueue({
  items,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
  className,
}: ApprovalQueueProps) {
  const list = Array.isArray(items) ? items : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Approval Queue</CardTitle>
        <p className="text-sm text-muted-foreground">
          Actions requiring human approval. Approve or reject to continue the run.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No actions pending approval.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-white/[0.06] bg-secondary/20 p-3 transition-colors hover:bg-secondary/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{item.actionType}</p>
                    {item.agentId != null && (
                      <p className="text-xs text-muted-foreground mt-0.5">Agent: {item.agentId}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Requested: {formatTime(item.requestedAt)}
                    </p>
                    {item.context != null && Object.keys(item.context).length > 0 && (
                      <pre className="mt-2 max-h-20 overflow-auto rounded bg-background/50 p-2 font-mono text-[10px] text-foreground">
                        {JSON.stringify(item.context, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {onApprove && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove(item.id)}
                        disabled={isApproving || isRejecting}
                        className="gap-1 text-teal focus-visible:ring-teal/50"
                        aria-label={`Approve ${item.actionType}`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                    {onReject && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(item.id)}
                        disabled={isApproving || isRejecting}
                        className="gap-1 text-destructive focus-visible:ring-destructive/50"
                        aria-label={`Reject ${item.actionType}`}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
