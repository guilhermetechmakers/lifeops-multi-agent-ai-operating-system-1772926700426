/**
 * AuditLogsPanel — Per-user or global audit trail with filters and export action.
 * Date range, action type, resource filters; export triggers AuditExportModal flow.
 */

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/use-admin";
import type { AuditLog } from "@/types/admin";
import { FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditLogsPanelProps {
  userId?: string | null;
  userName?: string | null;
  onExportClick?: (userId: string) => void;
  className?: string;
}

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "__all__", label: "All actions" },
  { value: "user.login", label: "user.login" },
  { value: "user.update", label: "user.update" },
  { value: "user.delete", label: "user.delete" },
  { value: "role.change", label: "role.change" },
  { value: "session.revoke", label: "session.revoke" },
];

export function AuditLogsPanel({
  userId,
  userName,
  onExportClick,
  className,
}: AuditLogsPanelProps) {
  const [actionFilter, setActionFilter] = useState<string>("__all__");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const params = {
    userId: userId ?? undefined,
    limit: 50,
    ...(actionFilter && actionFilter !== "__all__" ? { action: actionFilter } : {}),
    ...(fromDate ? { from: fromDate } : {}),
    ...(toDate ? { to: toDate } : {}),
  };

  const { logs = [], isLoading } = useAuditLogs(params);
  const logList: AuditLog[] = Array.isArray(logs) ? logs : [];

  const handleExport = useCallback(() => {
    if (userId && onExportClick) onExportClick(userId);
  }, [userId, onExportClick]);

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-shadow duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
            Audit logs
            {userName && (
              <span className="font-normal text-muted-foreground">· {userName}</span>
            )}
          </CardTitle>
          {userId && onExportClick && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/[0.03]"
              onClick={handleExport}
              aria-label="Export audit log"
            >
              <Download className="h-4 w-4" aria-hidden />
              Export
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Filter by action, date range; export for compliance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px] border-white/[0.03]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-[140px] border-white/[0.03]"
            aria-label="From date"
          />
          <Input
            type="date"
            placeholder="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-[140px] border-white/[0.03]"
            aria-label="To date"
          />
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          </div>
        ) : (logList ?? []).length === 0 ? (
          <div
            className="rounded-lg border border-white/[0.03] bg-secondary/20 px-4 py-8 text-center text-sm text-muted-foreground"
            role="status"
          >
            No audit entries match filters
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-sm" role="grid" aria-label="Audit log entries">
              <thead className="sticky top-0 z-10 border-b border-white/[0.03] bg-card">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Time
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Resource
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Actor
                  </th>
                </tr>
              </thead>
              <tbody>
                {(logList ?? []).map((entry) => (
                  <tr
                    key={entry?.id ?? ""}
                    className="border-b border-white/[0.03] transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {entry?.timestamp
                        ? new Date(entry.timestamp).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 font-medium">{entry?.action ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {entry?.resource ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {entry?.actor ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
