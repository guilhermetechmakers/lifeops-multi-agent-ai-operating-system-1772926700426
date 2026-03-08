/**
 * AuditTrailPreview — Read-only display of last consent update and changes.
 */

import { cn } from "@/lib/utils";
import type { AuditTrailEntry } from "@/types/cookie-policy";

interface AuditTrailPreviewProps {
  lastUpdated?: string;
  lastEntry?: AuditTrailEntry | null;
  className?: string;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function AuditTrailPreview({
  lastUpdated,
  lastEntry,
  className,
}: AuditTrailPreviewProps) {
  const timestamp = lastUpdated ?? lastEntry?.timestamp;
  const changes = lastEntry?.changes ?? [];

  if (!timestamp) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-secondary/30 px-4 py-3",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-xs font-medium text-muted-foreground">
        Last updated: {formatTimestamp(timestamp)}
      </p>
      {Array.isArray(changes) && changes.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground/90">
          {(changes ?? []).map((change, i) => (
            <li key={i}>• {change}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
