/**
 * AuditExportModal — Initiate audit export, track status, provide download URL.
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCreateUserAuditExport, useAuditExportStatus } from "@/hooks/use-admin";
import { Loader2, Download, CheckCircle, XCircle } from "lucide-react";

export interface AuditExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function AuditExportModal({ open, onOpenChange, userId }: AuditExportModalProps) {
  const [taskId, setTaskId] = useState<string | null>(null);
  const createExport = useCreateUserAuditExport();
  const { data: status } = useAuditExportStatus(taskId);

  useEffect(() => {
    if (!open) {
      setTaskId(null);
    }
  }, [open]);

  const handleStart = () => {
    createExport.mutate(userId, {
      onSuccess: (data) => {
        setTaskId(data?.id ?? null);
      },
    });
  };

  const isPending = status?.status === "pending" || status?.status === "in-progress";
  const isCompleted = status?.status === "completed";
  const isFailed = status?.status === "failed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="audit-export-desc">
        <DialogHeader>
          <DialogTitle>Export audit trail</DialogTitle>
          <p id="audit-export-desc" className="text-sm text-muted-foreground">
            Export this user&apos;s audit log for compliance. The export will be available for download when complete.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {!taskId ? (
            <p className="text-sm text-muted-foreground">
              Click Start to begin the export. You can track progress and download the file when ready.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {isPending && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm">Export in progress…</span>
                  </>
                )}
                {isCompleted && (
                  <>
                    <CheckCircle className="h-4 w-4 text-teal" />
                    <span className="text-sm text-teal">Export complete</span>
                  </>
                )}
                {isFailed && (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">Export failed</span>
                  </>
                )}
              </div>
              {isPending && (
                <Progress value={status?.status === "in-progress" ? 50 : 10} className="h-2" />
              )}
              {isCompleted && status?.exportUrl && (
                <Button
                  asChild
                  className="w-full gap-2"
                >
                  <a href={status.exportUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    Download export
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {taskId ? "Close" : "Cancel"}
          </Button>
          {!taskId && (
            <Button
              onClick={handleStart}
              disabled={createExport.isPending}
            >
              {createExport.isPending ? "Starting…" : "Start export"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
