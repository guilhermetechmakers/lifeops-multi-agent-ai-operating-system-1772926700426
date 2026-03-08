/**
 * AuditExportModal — Initiate per-user audit export, show status, provide download URL.
 * Tracks pending/in-progress/completed/failed; poll until completed or failed.
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
import { useCreateUserAuditExport, useAuditExportStatus } from "@/hooks/use-admin";
import { Loader2, CheckCircle2, XCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string | null;
  onSuccess?: () => void;
}

export function AuditExportModal({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: AuditExportModalProps) {
  const createExport = useCreateUserAuditExport();
  const [taskId, setTaskId] = useState<string | null>(null);

  const { data: task } = useAuditExportStatus(taskId);

  useEffect(() => {
    if (!open) setTaskId(null);
  }, [open]);

  const handleStart = async () => {
    if (!userId) return;
    const result = await createExport.mutateAsync(userId);
    if (result?.id) setTaskId(result.id);
  };

  const status = task?.status ?? null;
  const isPending = status === "pending" || status === "in-progress";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const exportUrl = task?.exportUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] sm:max-w-md"
        aria-labelledby="audit-export-title"
      >
        <DialogHeader>
          <DialogTitle id="audit-export-title" className="text-foreground">
            Export audit log
            {userName && (
              <span className="font-normal text-muted-foreground"> · {userName}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!taskId ? (
            <p className="text-sm text-muted-foreground">
              Start an export to download this user&apos;s audit trail. The file will be
              available when processing completes.
            </p>
          ) : (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border border-white/[0.03] px-3 py-3",
                isCompleted && "border-teal/30 bg-teal/5",
                isFailed && "border-[#FF3B30]/30 bg-[#FF3B30]/5"
              )}
              role="status"
              aria-live="polite"
            >
              {isPending && (
                <>
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber" aria-hidden />
                  <div>
                    <p className="text-sm font-medium">Export in progress</p>
                    <p className="text-xs text-muted-foreground">
                      This may take a moment…
                    </p>
                  </div>
                </>
              )}
              {isCompleted && (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">Export ready</p>
                    <p className="text-xs text-muted-foreground">
                      Download your audit log below.
                    </p>
                  </div>
                </>
              )}
              {isFailed && (
                <>
                  <XCircle className="h-5 w-5 shrink-0 text-[#FF3B30]" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">Export failed</p>
                    <p className="text-xs text-muted-foreground">
                      {task?.reason ?? "Please try again."}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-white/[0.03] pt-4">
          {!taskId ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStart}
                disabled={!userId || createExport.isPending}
                className="transition-transform duration-200 hover:scale-[1.02]"
              >
                {createExport.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  "Start export"
                )}
              </Button>
            </>
          ) : isCompleted && exportUrl ? (
            <>
              <Button
                asChild
                className="gap-2 transition-transform duration-200 hover:scale-[1.02]"
              >
                <a href={exportUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" aria-hidden />
                  Download
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onSuccess?.();
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </>
          ) : isFailed ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleStart} disabled={!userId || createExport.isPending}>
                Retry
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
