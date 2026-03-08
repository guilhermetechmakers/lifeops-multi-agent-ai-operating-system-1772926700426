/**
 * RecoveryAndWorkloadPanel — Recovery Score trend and workload balancing recommendations.
 * Accept/reject adjustments, preview schedule changes.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataVizChart } from "./data-viz-chart";
import { WorkloadRecommendationList } from "./workload-recommendation-list";
import type { RecoveryMetric, WorkloadRecommendation } from "@/types/health";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface RecoveryAndWorkloadPanelProps {
  recoveryMetrics: RecoveryMetric[];
  workloadRecommendations: WorkloadRecommendation | null;
  onApplyRecommendation?: (id: string) => void;
  isApplying?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function RecoveryAndWorkloadPanel({
  recoveryMetrics = [],
  workloadRecommendations,
  onApplyRecommendation,
  isApplying,
  isLoading,
  className,
}: RecoveryAndWorkloadPanelProps) {
  const metrics = Array.isArray(recoveryMetrics) ? recoveryMetrics : [];
  const recs = workloadRecommendations?.recommendations ?? [];
  const recsList = Array.isArray(recs) ? recs : [];

  const chartData = useMemo(() => {
    return [...(metrics ?? [])]
      .sort((a, b) => new Date(a?.timestamp ?? 0).getTime() - new Date(b?.timestamp ?? 0).getTime())
      .slice(-7)
      .map((m) => ({
        label: format(new Date(m?.timestamp ?? ""), "MMM d"),
        score: m?.score ?? 0,
      }));
  }, [metrics]);

  const latestScore = metrics.length > 0 ? (metrics[metrics.length - 1]?.score ?? 0) : 0;

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="card-health border-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recovery score trend
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Last 7 days — {latestScore}% current
          </p>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <DataVizChart
              type="line"
              data={chartData}
              categories={["label"]}
              series={[{ dataKey: "score", name: "Recovery", color: "teal" }]}
              height={180}
            />
          ) : (
            <div className="flex h-[180px] items-center justify-center rounded-lg bg-secondary/30 text-sm text-muted-foreground">
              No recovery data yet
            </div>
          )}
        </CardContent>
      </Card>

      <WorkloadRecommendationList
        recommendations={recsList}
        onApply={onApplyRecommendation}
        isLoading={isLoading}
        isApplying={isApplying}
      />
    </div>
  );
}
