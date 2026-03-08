/**
 * WorkloadRecommendationList — Recommended schedule changes with impact and confidence.
 * One-click apply, or route through approvals.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScheduleAdjustmentModal } from "./schedule-adjustment-modal";
import type { WorkloadRecommendationItem } from "@/types/health";
import { Activity, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkloadRecommendationListProps {
  recommendations: WorkloadRecommendationItem[];
  onApply?: (id: string) => void;
  isLoading?: boolean;
  isApplying?: boolean;
  className?: string;
}

export function WorkloadRecommendationList({
  recommendations = [],
  onApply,
  isLoading,
  isApplying,
  className,
}: WorkloadRecommendationListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState<WorkloadRecommendationItem | null>(null);

  const items = Array.isArray(recommendations) ? recommendations : [];

  const handleApplyClick = (rec: WorkloadRecommendationItem) => {
    setSelectedRec(rec);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (selectedRec?.id && onApply) {
      onApply(selectedRec.id);
    }
    setSelectedRec(null);
  };

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-40 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workload recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            No schedule adjustments suggested
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your schedule is balanced. Recommendations will appear when workload and recovery signals suggest changes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workload recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Suggested schedule changes to balance work and recovery
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((rec) => (
            <div
              key={rec?.id ?? ""}
              className="flex flex-col gap-2 rounded-md border border-white/[0.03] bg-secondary/20 p-3"
            >
              <p className="text-sm font-medium text-foreground">
                {rec?.changeDescription ?? ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Impact: {rec?.impact ?? ""}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Confidence: {((rec?.confidence ?? 0) * 100).toFixed(0)}%
                </span>
                {onApply && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyClick(rec)}
                    disabled={isApplying}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Apply
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ScheduleAdjustmentModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedRec(null);
        }}
        recommendation={selectedRec}
        onConfirm={handleConfirm}
        isLoading={isApplying}
      />
    </>
  );
}
