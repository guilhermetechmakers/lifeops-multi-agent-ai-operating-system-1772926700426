/**
 * SEOPerformancePanel — keyword recommendations, traffic estimates, SERP metrics.
 * Key metrics summary and sparkline per design spec.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ExternalLink, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSEOInsights } from "@/hooks/use-content-dashboard";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  const items = Array.isArray(insights) ? insights : [];
  const topItems = items.slice(0, 5);

  const { totalVolume, sparklineData } = useMemo(() => {
    const total = (items ?? []).reduce(
      (sum, i) => sum + (typeof i.searchVolume === "number" ? i.searchVolume : 0),
      0
    );
    const data = (items ?? [])
      .slice(0, 8)
      .map((i, idx) => ({
        name: i.keyword?.slice(0, 12) ?? `K${idx + 1}`,
        volume: typeof i.searchVolume === "number" ? i.searchVolume : 0,
      }));
    return { totalVolume: total, sparklineData: data };
  }, [items]);

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
            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" aria-hidden />
            <p className="text-sm text-muted-foreground">No SEO insights yet</p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="SEO keyword recommendations">
            {/* Key metrics + sparkline */}
            <div className="rounded-lg border border-white/[0.03] bg-secondary/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-teal" />
                <span className="text-xs font-medium text-muted-foreground">
                  Potential traffic (top keywords)
                </span>
              </div>
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {totalVolume.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  searches/mo
                </span>
              </p>
              {sparklineData.length > 0 && (
                <div className="h-12 mt-2 w-full" aria-hidden>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sparklineData}
                      margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                    >
                      <defs>
                        <linearGradient id="seoGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00C2A8" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#00C2A8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          background: "rgb(21 23 24)",
                          border: "1px solid rgba(255,255,255,0.03)",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                        formatter={(value: number) => [value.toLocaleString(), "Volume"]}
                        labelFormatter={(label) => `Keyword: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#00C2A8"
                        strokeWidth={1.5}
                        fill="url(#seoGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            {(topItems ?? []).map((insight) => (
              <div
                key={insight.id}
                role="listitem"
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
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
                  onClick={() => handleOpenEditor({ contentItemId: insight.contentItemId })}
                  aria-label={`Open ${insight.keyword} in editor`}
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
