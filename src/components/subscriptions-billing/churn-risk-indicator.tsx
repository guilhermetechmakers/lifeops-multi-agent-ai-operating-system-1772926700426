/**
 * ChurnRiskIndicator — Risk score, trends, recommended agent actions.
 * Auto-remedial or approvals required.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChurnAction {
  id: string;
  label: string;
  type: "auto" | "approval";
  rationale?: string;
}

export interface ChurnRiskData {
  subscriptionId: string;
  vendor: string;
  score: number;
  trend: "up" | "down" | "stable";
  recommendedAction: string;
  requiresApproval: boolean;
}

export interface ChurnRiskIndicatorProps {
  /** Legacy: aggregate risk score 0–1 */
  riskScore?: number;
  trend?: "up" | "down" | "stable";
  atRiskCount?: number;
  recommendedActions?: ChurnAction[];
  onApplyAction?: (actionId: string) => void;
  /** Per-subscription churn risk items */
  items?: ChurnRiskData[];
  onApplyToSubscription?: (subscriptionId: string) => void;
  className?: string;
}

export function ChurnRiskIndicator({
  riskScore = 0,
  trend = "stable",
  atRiskCount = 0,
  recommendedActions = [],
  onApplyAction,
  items = [],
  onApplyToSubscription,
  className,
}: ChurnRiskIndicatorProps) {
  const list = Array.isArray(items) ? items : [];
  const displayCount = list.length > 0 ? list.length : atRiskCount;
  const scorePct =
    list.length > 0
      ? Math.round(
          (list.reduce((s, x) => s + (x.score ?? 0), 0) / list.length) * 100
        )
      : Math.round((riskScore ?? 0) * 100);
  const isHigh = scorePct >= 50;
  const isMedium = scorePct >= 25 && scorePct < 50;
  const actions = Array.isArray(recommendedActions) ? recommendedActions : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <TrendingDown className="h-5 w-5 text-amber" aria-hidden />
          Churn risk
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {displayCount} subscription{displayCount !== 1 ? "s" : ""} at risk
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-bold",
              isHigh && "bg-destructive/20 text-destructive",
              isMedium && "bg-amber/20 text-amber",
              !isHigh && !isMedium && "bg-teal/20 text-teal"
            )}
          >
            {scorePct}%
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {isHigh ? "High" : isMedium ? "Medium" : "Low"} overall risk
            </p>
            <p className="text-xs text-muted-foreground">
              {trend === "up" && "Trending up"}
              {trend === "down" && "Trending down"}
              {trend === "stable" && "Stable"}
            </p>
          </div>
        </div>

        {list.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              At-risk subscriptions
            </p>
            <div className="space-y-2">
              {list.map((item) => (
                <div
                  key={item.subscriptionId}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] p-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.vendor ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.recommendedAction ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.requiresApproval && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Shield className="h-3 w-3 mr-0.5" />
                        Approval
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs"
                      onClick={() =>
                        onApplyToSubscription?.(item.subscriptionId)
                      }
                    >
                      Apply
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          actions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Recommended actions
              </p>
              <div className="space-y-2">
                {actions.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.03] p-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {a.label ?? "—"}
                      </p>
                      {a.rationale && (
                        <p className="text-xs text-muted-foreground truncate">
                          {a.rationale}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {a.type === "auto" && (
                        <Badge variant="outline" className="text-[10px]">
                          Auto
                        </Badge>
                      )}
                      {a.type === "approval" && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Shield className="h-3 w-3 mr-0.5" />
                          Approval
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        onClick={() => onApplyAction?.(a.id)}
                      >
                        Apply
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
