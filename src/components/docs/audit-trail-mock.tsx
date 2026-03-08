import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  artifactRef?: string;
}

interface AuditTrailMockProps {
  logs?: AuditLogEntry[];
  className?: string;
}

const defaultLogs: AuditLogEntry[] = [
  { id: "1", action: "schedule_adjusted", timestamp: "2024-03-08T10:00:00Z", user: "system", artifactRef: "run_abc123" },
  { id: "2", action: "approval_granted", timestamp: "2024-03-08T09:45:00Z", user: "sarah@example.com" },
  { id: "3", action: "cronjob_created", timestamp: "2024-03-08T09:30:00Z", user: "marcus@example.com", artifactRef: "cron_xyz" },
];

export function AuditTrailMock({ logs = [], className }: AuditTrailMockProps) {
  const items = Array.isArray(logs) ? logs : defaultLogs;

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-card p-4",
        className
      )}
      role="region"
      aria-label="Audit trail (demo)"
    >
      <h3 className="text-sm font-medium text-foreground mb-3">Recent activity</h3>
      <ul className="space-y-2">
        {(items ?? []).map((log) => (
          <li
            key={log?.id ?? ""}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            <span className="text-xs font-mono text-teal/80">{log?.timestamp ?? ""}</span>
            <span className="text-foreground">
              {log?.action ?? ""}
              {log?.artifactRef && (
                <span className="text-muted-foreground ml-1">({log.artifactRef})</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
