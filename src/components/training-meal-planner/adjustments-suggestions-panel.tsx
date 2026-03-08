/**
 * Adjustments & Suggestions Panel — Agent-suggested swaps, accept/reject workflow.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentSuggestion, Adjustment } from "@/types/training-meals";

export interface AdjustmentsSuggestionsPanelProps {
  suggestions?: AgentSuggestion[];
  onAccept?: (suggestion: AgentSuggestion) => void;
  onReject?: (suggestion: AgentSuggestion) => void;
  onFetchSuggestions?: () => void;
  isFetching?: boolean;
  hasPlan?: boolean;
  className?: string;
}

export function AdjustmentsSuggestionsPanel({
  suggestions = [],
  onAccept,
  onReject,
  onFetchSuggestions,
  isFetching = false,
  hasPlan = false,
  className,
}: AdjustmentsSuggestionsPanelProps) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-5 w-5 text-purple" aria-hidden />
          Agent suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-recommended swaps and adjustments for your plan
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPlan && onFetchSuggestions && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFetchSuggestions}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="mr-1 h-3 w-3" />
            )}
            Get suggestions
          </Button>
        )}

        {safeSuggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No suggestions yet</p>
            <p className="text-xs text-muted-foreground">
              Generate a plan and click &quot;Get suggestions&quot; for AI recommendations
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {(safeSuggestions ?? []).map((sug) => (
              <li
                key={sug.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/20 p-4"
              >
                {sug.rationale && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {sug.rationale}
                  </p>
                )}
                <ul className="space-y-2">
                  {((sug as { adjustments?: Adjustment[] }).adjustments ?? (sug.adjustment ? [sug.adjustment] : [])).map((adj) => (
                    <li
                      key={adj.id}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {adj.description}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {Math.round((sug.confidence ?? 0) * 100)}% confidence
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  {onAccept && (
                    <Button
                      size="sm"
                      className="gap-1 transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => onAccept(sug)}
                    >
                      <Check className="h-3 w-3" />
                      Accept
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => onReject(sug)}
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
