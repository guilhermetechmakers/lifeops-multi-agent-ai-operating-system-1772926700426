/**
 * AgentSuggestionsPanel — next steps, automation recipes, tactical actions.
 * Apply or dismiss suggestions; optional convert to automation rules.
 */

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProjectAgentSuggestions,
  useAcceptSuggestion,
  useDismissSuggestion,
} from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { AgentSuggestion } from "@/types/projects";

export interface AgentSuggestionsPanelProps {
  projectId: string;
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  next_step: "Next step",
  automation_recipe: "Automation",
  tactical_action: "Action",
};

export function AgentSuggestionsPanel({ projectId, className }: AgentSuggestionsPanelProps) {
  const { items: suggestions, isLoading } = useProjectAgentSuggestions(projectId);
  const acceptSuggestion = useAcceptSuggestion(projectId);
  const dismissSuggestion = useDismissSuggestion(projectId);
  const list = Array.isArray(suggestions) ? suggestions : [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple" />
          Agent Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No suggestions
          </div>
        ) : (
          <div className="space-y-2">
            {(list as AgentSuggestion[]).map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
              >
                <Badge variant="secondary" className="text-[10px] mb-1.5">
                  {TYPE_LABELS[s.type] ?? s.type}
                </Badge>
                <p className="text-sm text-foreground line-clamp-2">{s.content}</p>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => acceptSuggestion.mutate(s.id)}
                    disabled={acceptSuggestion.isPending}
                    aria-label={`Apply suggestion: ${s.content.slice(0, 40)}`}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => dismissSuggestion.mutate(s.id)}
                    disabled={dismissSuggestion.isPending}
                    aria-label="Dismiss suggestion"
                  >
                    Dismiss
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
