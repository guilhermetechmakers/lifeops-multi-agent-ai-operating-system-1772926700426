/**
 * AdjustmentsSuggestionsPanel — Agent-suggested swaps/portions with Accept/Reject flow.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentSuggestion, Adjustment } from "@/types/training-meals";

export interface AdjustmentsSuggestionsPanelProps {
  suggestions: AgentSuggestion[];
  onAccept: (adjustments: Adjustment[]) => void;
  onReject?: (suggestionId: string) => void;
  onRequestSuggestions?: () => void;
  isSuggesting?: boolean;
  className?: string;
}

export function AdjustmentsSuggestionsPanel({
  suggestions = [],
  onAccept,
  onReject,
  onRequestSuggestions,
  isSuggesting = false,
  className,
}: AdjustmentsSuggestionsPanelProps) {
  const safeList = Array.isArray(suggestions) ? suggestions : [];

  const handleAcceptOne = (suggestion: AgentSuggestion) => {
    onAccept([suggestion.adjustment]);
  };

  const handleAcceptAll = () => {
    const adjustments = safeList.map((s) => s.adjustment).filter(Boolean);
    if (adjustments.length > 0) onAccept(adjustments);
  };

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden />
          Adjustments & suggestions
        </CardTitle>
        {onRequestSuggestions && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestSuggestions}
            disabled={isSuggesting}
          >
            {isSuggesting ? "Loading…" : "Get suggestions"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Agent-suggested swaps and adjustments. Accept or reject each suggestion.
        </p>
        {safeList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No suggestions yet</p>
            <p className="text-xs text-muted-foreground">
              Generate a plan and click “Get suggestions” for agent recommendations
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button size="sm" onClick={handleAcceptAll} className="transition-transform duration-200 hover:scale-[1.02]">
                <Check className="mr-1 h-3 w-3" />
                Accept all
              </Button>
            </div>
            <ul className="space-y-3" role="list">
              {safeList.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4 transition-all duration-200 hover:bg-secondary/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {s.adjustment?.description ?? "—"}
                      </p>
                      {s.rationale && (
                        <p className="mt-1 text-xs text-muted-foreground">{s.rationale}</p>
                      )}
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {(s.confidence ?? 0) * 100}% confidence
                      </Badge>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-teal hover:bg-teal/10"
                        onClick={() => handleAcceptOne(s)}
                        aria-label="Accept suggestion"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      {onReject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onReject(s.id)}
                          aria-label="Reject suggestion"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
