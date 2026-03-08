/**
 * AgentRecommendationsPanel — Recommendations for optimizing spend, reducing churn, adjusting subscriptions.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentRecommendationBilling } from "@/types/finance";

interface AgentRecommendationsPanelProps {
  recommendations: AgentRecommendationBilling[];
  isLoading?: boolean;
  onExecute?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function AgentRecommendationsPanelBilling({
  recommendations,
  isLoading,
  onExecute,
  onDismiss,
  className,
}: AgentRecommendationsPanelProps) {
  const items = Array.isArray(recommendations) ? recommendations : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-5 w-5 text-amber" />
          Agent Recommendations
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Spend optimization and churn reduction
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No recommendations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
              >
                <p className="text-xs text-muted-foreground">{rec.context ?? "—"}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{rec.action ?? "—"}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {(rec.confidence ?? 0) * 100}% confidence
                    {rec.expectedROI != null && ` · ROI: ${(rec.expectedROI * 100).toFixed(0)}%`}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => onExecute?.(rec.id)}
                    >
                      Take action
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => onDismiss?.(rec.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
