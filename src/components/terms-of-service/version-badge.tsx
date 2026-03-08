/**
 * VersionBadge — Displays ToS version and effective date.
 * LifeOps design system: dark UI, subtle accent.
 */

import { cn } from "@/lib/utils";
import type { ToSVersionInfo } from "@/types/terms-of-service";

export interface VersionBadgeProps {
  versionInfo?: ToSVersionInfo | null;
  className?: string;
}

const DEFAULT_VERSION = "1.0.0";
const DEFAULT_DATE = "March 2025";

export function VersionBadge({ versionInfo, className }: VersionBadgeProps) {
  const version = versionInfo?.version ?? DEFAULT_VERSION;
  const effectiveDate = versionInfo?.effectiveDate ?? DEFAULT_DATE;

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.03] bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground",
        className
      )}
      role="status"
      aria-label={`Terms version ${version}, effective ${effectiveDate}`}
    >
      <span className="font-medium text-foreground">v{version}</span>
      <span aria-hidden>·</span>
      <span>Effective {effectiveDate}</span>
    </div>
  );
}
