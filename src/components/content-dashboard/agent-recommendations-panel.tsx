/**
 * AgentRecommendationsPanel — suggested topics, outlines, promotional ideas with confidence.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAgentRecommendations,
  useOpenEditor,
} from "@/hooks/use-content-dashboard";
import { useNavigate } from "react-router-dom";

export interface AgentRecommendationsPanelProps {
  onUseIdea?: (topic: string, rationale: string) => void;
  className?: string;
}

export function AgentRecommendationsPanel({ onUseIdea, className }: AgentRecommendationsPanelProps) {
  const { data: recommendations, isLoading } = useAgentRecommendations();
  const openEditor = useOpenEditor();
  const navigate = useNavigate();

  const items = recommendations ?? [];

  const handleUseTopic = (topic: string, rationale: string) => {
    if (onUseIdea) {
      onUseIdea(topic, rationale);
      return;
    }
    openEditor.mutate(
      { topic },
      {
        onSuccess: (res) => {
          if (res?.url) navigate(res.url);
          else navigate(`/dashboard/content/editor?topic=${encodeURIComponent(topic)}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Agent Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
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
          <Lightbulb className="h-5 w-5 text-amber" />
          Agent Recommendations
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Topics, outlines, promotional ideas
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-6 text-center">
            <Lightbulb className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recommendations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(items ?? []).map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
              >
                <p className="text-sm font-medium text-foreground">{rec.topic}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {rec.rationale}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {(rec.confidence * 100).toFixed(0)}% confidence
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleUseTopic(rec.topic, rec.rationale)}
                    disabled={openEditor.isPending}
                  >
                    Use in Editor
                    <ArrowRight className="h-3 w-3" />
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
