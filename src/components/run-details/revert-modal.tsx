/**
 * RevertModal — confirm revert actions with audit trail details.
 * Spec: page_run_details_010 RevertModal with audit details.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReversibleAction, AuditEvent } from "@/types/run-details";

const AUDIT_PREVIEW_LIMIT = 5;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export interface RevertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reversibleActions: ReversibleAction[];
  auditTrail: AuditEvent[];
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  isReverting?: boolean;
  confirmLabel?: string;
  className?: string;
}

export function RevertModal({
  open,
  onOpenChange,
  reversibleActions,
  auditTrail,
  reason,
  onReasonChange,
  onConfirm,
  isReverting = false,
  confirmLabel = "Confirm Revert",
  className,
}: RevertModalProps) {
  const actionsList = Array.isArray(reversibleActions) ? reversibleActions : [];
  const auditList = Array.isArray(auditTrail) ? auditTrail.slice(-AUDIT_PREVIEW_LIMIT).reverse() : [];

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn("max-h-[90vh] flex flex-col border-white/[0.06] bg-card", className)}
        aria-describedby="revert-modal-description"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber" aria-hidden />
            Confirm revert
          </AlertDialogTitle>
          <AlertDialogDescription id="revert-modal-description">
            This will revert the reversible actions for this run. The change will be recorded in the audit trail. Provide a reason below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="revert-reason">Reason (required for audit)</Label>
            <Input
              id="revert-reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="e.g. Incorrect configuration applied"
              className="bg-background"
              aria-required="true"
              disabled={isReverting}
            />
          </div>

          {actionsList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reversible actions ({actionsList.length})
              </p>
              <ScrollArea className="h-24 rounded-md border border-white/[0.06] bg-secondary/20 p-2">
                <ul className="space-y-1 text-sm">
                  {actionsList.map((a) => (
                    <li key={a.actionId} className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{a.type}</span>
                      {a.targetResource != null && (
                        <span className="truncate text-xs text-muted-foreground" title={a.targetResource}>
                          {a.targetResource}
                        </span>
                      )}
                      <span
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                          a.status === "passed" || a.status === "approved"
                            ? "bg-teal/20 text-teal"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {a.status ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {auditList.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <History className="h-3.5 w-3.5" aria-hidden />
                Recent audit trail
              </p>
              <ScrollArea className="h-28 rounded-md border border-white/[0.06] bg-secondary/20 p-2">
                <ul className="space-y-1.5 text-xs">
                  {auditList.map((e) => (
                    <li key={e.id} className="flex flex-col gap-0.5">
                      <span className="font-mono text-muted-foreground">{formatTime(e.timestamp)}</span>
                      <span className="font-medium text-foreground">{e.action}</span>
                      {e.details != null && (
                        <span className="truncate text-muted-foreground">
                          {typeof e.details === "string" ? e.details : JSON.stringify(e.details)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isReverting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isReverting || !reason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            aria-label={confirmLabel}
          >
            {isReverting ? "Reverting…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
