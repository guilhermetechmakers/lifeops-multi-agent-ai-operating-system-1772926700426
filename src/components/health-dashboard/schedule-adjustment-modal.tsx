/**
 * ScheduleAdjustmentModal — Apply suggested schedule changes with rationale.
 * Confirm, cancel; track approval state.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { WorkloadRecommendationItem } from "@/types/health";

export interface ScheduleAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: WorkloadRecommendationItem | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ScheduleAdjustmentModal({
  open,
  onOpenChange,
  recommendation,
  onConfirm,
  isLoading,
}: ScheduleAdjustmentModalProps) {
  const rec = recommendation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply schedule adjustment</DialogTitle>
          <DialogDescription>
            Review the suggested change before applying. This will update your calendar and plans.
          </DialogDescription>
        </DialogHeader>
        {rec && (
          <div className="space-y-4 py-4">
            <div className="rounded-md border border-white/[0.03] bg-secondary/20 p-4">
              <p className="text-sm font-medium text-foreground">
                {rec.changeDescription ?? ""}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Impact: {rec.impact ?? ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Confidence: {((rec.confidence ?? 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            {isLoading ? "Applying…" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
