/**
 * ChurnRiskIndicator — Visual component showing risk score, trends, and recommended agent actions.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChurnRiskData {
  subscriptionId: string;
  vendor: string;
  score: number;
  trend?: "up" | "down" | "stable";
  recommendedAction?: string;
  requiresApproval?: boolean;
}

interface ChurnRiskIndicatorProps {
  items: ChurnRiskData[];
  isLoading?: boolean;
  onApplyAction?: (subscriptionId: string, action: string) => void;
  className?: string;
}

function getRiskLabel(score: number): { label: string; variant: "destructive" | "warning" | "secondary" } {
  if (score >= 0.5) return { label: "High", variant: "destructive" };
  if (score >= 0.25) return { label: "Medium", variant: "warning" };
  return { label: "Low", variant: "secondary" };
}

export function ChurnRiskIndicator({
  items,
  isLoading,
  onApplyAction,
  className,
}: ChurnRiskIndicatorProps) {
  const list = Array.isArray(items) ? items : [];
  const atRisk = list.filter((i) => (i.score ?? 0) >= 0.25);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber" />
          Churn Risk
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {atRisk.length} subscription{atRisk.length !== 1 ? "s" : ""} at risk
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : atRisk.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No subscriptions at churn risk</p>
          </div>
        ) : (
          <div className="space-y-3">
            {atRisk.map((item) => {
              const risk = getRiskLabel(item.score ?? 0);
              const TrendIcon = item.trend === "up" ? TrendingUp : item.trend === "down" ? TrendingDown : null;
              return (
                <div
                  key={item.subscriptionId}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:shadow-card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.vendor ?? "—"}</span>
                      <Badge variant={risk.variant} className="text-[10px] shrink-0">
                        {risk.label}
                      </Badge>
                      {TrendIcon && (
                        <TrendIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                    {item.recommendedAction && (
                      <p className="mt-1 text-xs text-muted-foreground">{item.recommendedAction}</p>
                    )}
                  </div>
                  {item.recommendedAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs shrink-0 ml-2"
                      onClick={() => onApplyAction?.(item.subscriptionId, item.recommendedAction ?? "")}
                    >
                      {item.requiresApproval ? "Review" : "Apply"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
