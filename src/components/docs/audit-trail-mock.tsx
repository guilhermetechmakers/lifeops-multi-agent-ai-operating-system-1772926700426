import { cn } from "@/lib/utils";

export interface AuditLogEntry {
  id: string;
  action: string;
  timestamp: string;
  artifactRef?: string;
}

export interface AuditTrailMockProps {
  entries?: AuditLogEntry[];
  className?: string;
}

export function AuditTrailMock({ entries = [], className }: AuditTrailMockProps) {
  const list = Array.isArray(entries) ? entries : [];

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.06] bg-card overflow-hidden",
        className
      )}
      role="region"
      aria-label="Audit trail (read-only demo)"
    >
      <div className="border-b border-white/[0.06] px-4 py-2">
        <h3 className="text-sm font-medium text-foreground">Run artifacts / audit log</h3>
        <p className="text-xs text-muted-foreground">Read-only demo</p>
      </div>
      <ul className="divide-y divide-white/[0.03] max-h-48 overflow-y-auto">
        {list.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No entries. Actions will appear here when applied.
          </li>
        ) : (
          list.map((entry) => (
            <li
              key={entry?.id ?? ""}
              className="px-4 py-2 text-sm flex flex-wrap items-center gap-2"
            >
              <span className="font-medium text-foreground">{entry?.action ?? ""}</span>
              <span className="text-muted-foreground text-xs">{entry?.timestamp ?? ""}</span>
              {entry?.artifactRef && (
                <span className="font-mono text-xs text-teal">{entry.artifactRef}</span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
