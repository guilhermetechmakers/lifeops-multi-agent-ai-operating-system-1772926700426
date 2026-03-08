/**
 * ApprovalsQueuePanel — items requiring review with approve/reject actions.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CheckSquare, Check, X } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useApprovalsQueue, useDecideApproval } from "@/hooks/use-content-dashboard";

export interface ApprovalsQueuePanelProps {
  className?: string;
}

export function ApprovalsQueuePanel({ className }: ApprovalsQueuePanelProps) {
  const { items, isLoading } = useApprovalsQueue();
  const decideApproval = useDecideApproval();
  const pending = (Array.isArray(items) ? items : []).filter(
    (a) => a.status === "pending"
  );

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
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
          <CheckSquare className="h-5 w-5 text-primary" />
          Approvals Queue
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Items requiring review
        </p>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pending approvals
          </p>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {(pending ?? []).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {item.contentTitle ?? "Content approval"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.reviewerName ?? "Reviewer"} ·{" "}
                  {formatDistanceToNow(parseISO(item.requestedAt), {
                    addSuffix: true,
                  })}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() =>
                      decideApproval.mutate({
                        runId: item.runId,
                        approvalId: item.id,
                        status: "approved",
                      })
                    }
                    disabled={decideApproval.isPending}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs border-white/[0.03]"
                    onClick={() =>
                      decideApproval.mutate({
                        runId: item.runId,
                        approvalId: item.id,
                        status: "rejected",
                      })
                    }
                    disabled={decideApproval.isPending}
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
