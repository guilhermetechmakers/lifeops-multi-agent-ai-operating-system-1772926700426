/**
 * Empty state for Approvals Queue when no items match filters.
 */

import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export function EmptyState({ hasFilters, onClearFilters, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.06] bg-secondary/20 py-16 px-6 text-center",
        className
      )}
    >
      <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
      <h3 className="text-base font-semibold text-foreground">
        {hasFilters ? "No approvals match your filters" : "No pending approvals"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {hasFilters
          ? "Try adjusting filters or clear them to see all items."
          : "When scheduled actions or cron runs require human review, they will appear here."}
      </p>
      {hasFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
