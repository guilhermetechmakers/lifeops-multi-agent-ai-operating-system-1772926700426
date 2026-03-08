import { cn } from "@/lib/utils";

export type StatusBadgeStatus = "stable" | "beta" | "deprecated";

export interface StatusBadgeProps {
  status?: StatusBadgeStatus | null;
  className?: string;
}

const statusStyles: Record<StatusBadgeStatus, string> = {
  stable: "bg-teal/20 text-teal border-teal/30",
  beta: "bg-amber/20 text-amber border-amber/30",
  deprecated: "bg-muted text-muted-foreground border-white/[0.06]",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;
  const style = statusStyles[status] ?? statusStyles.stable;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
