/**
 * AuditLogsPanel — Per-user audit trail viewer with filters and export.
 * Filters: date range, action type, resource.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/use-admin";
import type { AdminUser, AuditLog } from "@/types/admin";
import { FileText, Download } from "lucide-react";
import { AuditExportModal } from "./audit-export-modal";
import { OrgManagementLink } from "./org-management-link";

export interface AuditLogsPanelProps {
  user: AdminUser | null;
  onClose: () => void;
}

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

const ACTION_OPTIONS = ["", "user.login", "user.update", "user.create", "user.delete", "role.assign", "session.revoke"];

export function AuditLogsPanel({ user, onClose }: AuditLogsPanelProps) {
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const params = {
    userId: user?.id ?? undefined,
    limit: 100,
    action: actionFilter || undefined,
    resource: resourceFilter || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  const { logs, isLoading } = useAuditLogs(params);
  const logList = (logs ?? []) as AuditLog[];

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col" aria-describedby="audit-panel-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit logs
          </DialogTitle>
          <p id="audit-panel-desc" className="text-sm text-muted-foreground">
            {user?.name ?? "—"} · {user?.email ?? "—"}
          </p>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="audit-action">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="audit-action" className="mt-1">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {ACTION_OPTIONS.filter(Boolean).map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="audit-resource">Resource</Label>
              <Input
                id="audit-resource"
                placeholder="Filter resource"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="audit-from">From</Label>
              <Input
                id="audit-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="audit-to">To</Label>
              <Input
                id="audit-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <OrgManagementLink orgId={user?.orgId ?? ""} />
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export audit
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-md border border-white/[0.03] bg-secondary/30">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-secondary/50" />
                ))}
              </div>
            ) : logList.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No audit logs match your filters</p>
            ) : (
              <ul className="divide-y divide-white/[0.03]" role="list">
                {logList.map((log) => (
                  <li
                    key={log?.id ?? ""}
                    className="px-4 py-3 text-sm transition-colors duration-200 hover:bg-secondary/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium">{log?.action ?? "—"}</span>
                        <span className="text-muted-foreground"> · {log?.resource ?? "—"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimestamp(log?.timestamp)}
                      </span>
                    </div>
                    {log?.actor && (
                      <p className="mt-1 text-xs text-muted-foreground">Actor: {log.actor}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>

      <AuditExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        userId={user?.id ?? ""}
      />
    </Dialog>
  );
}
