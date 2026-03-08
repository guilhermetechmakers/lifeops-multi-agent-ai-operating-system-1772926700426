/**
 * AuditTrailPanel — immutable append-only log for this run; filters, export CSV/JSON.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "@/types/run-details";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export interface AuditTrailPanelProps {
  auditTrail: AuditEvent[];
  className?: string;
}

export function AuditTrailPanel({ auditTrail, className }: AuditTrailPanelProps) {
  const [actionFilter, setActionFilter] = useState("");
  const list = useMemo(() => {
    const arr = Array.isArray(auditTrail) ? auditTrail : [];
    if (!actionFilter) return arr;
    return arr.filter((e) => (e.action ?? "").toLowerCase().includes(actionFilter.toLowerCase()));
  }, [auditTrail, actionFilter]);

  const actions = useMemo(() => {
    const arr = Array.isArray(auditTrail) ? auditTrail : [];
    return [...new Set(arr.map((e) => e.action).filter(Boolean))].sort();
  }, [auditTrail]);

  const exportCsv = () => {
    const headers = ["id", "timestamp", "userId", "action", "details"];
    const rows = list.map((e) => [
      e.id,
      e.timestamp,
      e.userId ?? "",
      e.action,
      e.details != null ? JSON.stringify(e.details) : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-trail.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-trail.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Audit Trail</CardTitle>
            <p className="text-sm text-muted-foreground">
              Immutable log for this run, approvals, and user actions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv} aria-label="Export CSV">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={exportJson} aria-label="Export JSON">
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {(list ?? []).length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No audit events. Run and user actions will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-white/[0.06] bg-secondary/20 p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{e.action}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {formatTime(e.timestamp)}
                  </span>
                  {e.userId != null && (
                    <span className="ml-2 text-muted-foreground">by {e.userId}</span>
                  )}
                </div>
                {e.details != null && (
                  <pre className="w-full rounded border border-white/[0.06] bg-background/80 p-2 font-mono text-xs text-muted-foreground">
                    {typeof e.details === "string"
                      ? e.details
                      : JSON.stringify(e.details, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
