/**
 * SubscriptionHistoryTimeline — vertical timeline: change type, effective date, plan change, delta cost.
 */

import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SubscriptionChange, SubscriptionChangeType } from "@/types/billing-history";

function ChangeIcon({ type }: { type: SubscriptionChangeType }) {
  switch (type) {
    case "upgrade":
      return <ArrowUpRight className="h-4 w-4 text-[#00C2A8]" />;
    case "downgrade":
      return <ArrowDownRight className="h-4 w-4 text-[#FFB020]" />;
    case "renewal":
      return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
    case "cancel":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
  }
}

export interface SubscriptionHistoryTimelineProps {
  changes: SubscriptionChange[];
  className?: string;
}

export function SubscriptionHistoryTimeline({ changes, className }: SubscriptionHistoryTimelineProps) {
  const safeChanges = changes ?? [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Subscription changes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upgrades, downgrades, renewals, and cancellations
        </p>
      </CardHeader>
      <CardContent>
        {safeChanges.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No subscription changes yet</p>
        ) : (
          <div className="relative space-y-0">
            {/* vertical line */}
            <div
              className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.06]"
              aria-hidden
            />
            {(safeChanges ?? []).map((ch) => (
              <div key={ch.id} className="relative flex gap-4 pb-4 last:pb-0">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-card">
                  <ChangeIcon type={ch.change_type} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-foreground capitalize">
                    {ch.change_type ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ch.effective_date ? format(new Date(ch.effective_date), "MMM d, yyyy") : "—"}
                  </p>
                  {(ch.old_plan_id || ch.new_plan_id) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {ch.old_plan_id && <span>{ch.old_plan_id}</span>}
                      {ch.old_plan_id && ch.new_plan_id && " → "}
                      {ch.new_plan_id && <span>{ch.new_plan_id}</span>}
                    </p>
                  )}
                  {ch.delta_cost != null && ch.delta_cost !== 0 && (
                    <p className="text-xs font-medium text-foreground mt-1">
                      Δ ${ch.delta_cost.toFixed(2)}
                    </p>
                  )}
                  {ch.reason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{ch.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
