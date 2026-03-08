/**
 * SummaryCard — compact statistic block for quick glance (e.g. total paid, due amount).
 */

import { cn } from "@/lib/utils";

export interface SummaryCardProps {
  title: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function SummaryCard({ title, value, hint, className }: SummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-card p-4 transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
      {hint != null && hint !== "" && (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
