/**
 * AgentInsightsPanel — AI-generated recommendations for spend and cash flow.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, ArrowRight, Pin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsightItem } from "@/types/forecasting";

interface AgentInsightsPanelProps {
  items: InsightItem[];
  isLoading?: boolean;
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onPin?: (id: string) => void;
  className?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  high: "text-destructive border-destructive/30",
  medium: "text-amber border-amber/30",
  low: "text-muted-foreground border-white/10",
};

export function AgentInsightsPanel({
  items,
  isLoading,
  onApply,
  onDismiss,
  onPin,
  className,
}: AgentInsightsPanelProps) {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const safeItems = Array.isArray(items) ? items : [];
  const filtered =
    severityFilter === "all"
      ? safeItems
      : safeItems.filter((i) => i.severity === severityFilter);

  const handlePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    onPin?.(id);
  };

  const sorted = [...filtered].sort((a, b) => {
    const aPin = pinnedIds.has(a.id) ? 1 : 0;
    const bPin = pinnedIds.has(b.id) ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  });

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-5 w-5 text-amber" />
            Agent Insights
          </CardTitle>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-8 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Recommendations to optimize spend and cash flow
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary/50" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-8 text-center">
            <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No insights yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-lg border p-3 transition-all duration-200 hover:shadow-card-hover",
                  SEVERITY_COLORS[item.severity] ?? "border-white/[0.03]",
                  "bg-secondary/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.text}</p>
                    {item.suggestedAction && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        → {item.suggestedAction}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handlePin(item.id)}
                      aria-label={pinnedIds.has(item.id) ? "Unpin" : "Pin"}
                    >
                      <Pin
                        className={cn(
                          "h-3.5 w-3.5",
                          pinnedIds.has(item.id) && "fill-amber text-amber"
                        )}
                      />
                    </Button>
                    {item.suggestedAction && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() => onApply?.(item.id)}
                      >
                        Apply
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => onDismiss?.(item.id)}
                      aria-label="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
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
