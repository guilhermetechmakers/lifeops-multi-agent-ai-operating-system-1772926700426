/**
 * SEOPerformancePanel — keyword recommendations, traffic estimates, SERP metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSEOInsights } from "@/hooks/use-content-dashboard";
import { useNavigate } from "react-router-dom";

export interface SEOPerformancePanelProps {
  contentItemId?: string;
  onOpenEditor?: (contentItemId: string) => void;
  className?: string;
}

export function SEOPerformancePanel({
  contentItemId,
  onOpenEditor,
  className,
}: SEOPerformancePanelProps) {
  const { data: insights, isLoading } = useSEOInsights(contentItemId);
  const navigate = useNavigate();

  const items = insights ?? [];
  const topItems = items.slice(0, 5);

  const handleOpenEditor = (item: { contentItemId: string }) => {
    if (onOpenEditor) {
      onOpenEditor(item.contentItemId);
      return;
    }
    navigate(`/dashboard/content/editor?itemId=${item.contentItemId}`);
  };

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">SEO & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
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
          <TrendingUp className="h-5 w-5 text-teal" />
          SEO & Performance
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Keyword suggestions, traffic estimates
        </p>
      </CardHeader>
      <CardContent>
        {topItems.length === 0 ? (
          <div className="py-6 text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No SEO insights yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(topItems ?? []).map((insight) => (
              <div
                key={insight.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:shadow-card-hover"
              >
                <p className="text-sm font-medium text-foreground">
                  {insight.keyword}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>Vol: {insight.searchVolume?.toLocaleString() ?? "—"}</span>
                  <span>Diff: {insight.difficulty ?? "—"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {insight.suggestedTitle}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs mt-2 gap-1"
                  onClick={() => handleOpenEditor(insight)}
                >
                  Open in Editor
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
