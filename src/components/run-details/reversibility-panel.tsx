/**
 * ReversibilityPanel — reversible actions, validators, confirmations; Confirm Revert / Cancel.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReversibleAction } from "@/types/run-details";

export interface ReversibilityPanelProps {
  reversibleActions: ReversibleAction[];
  canRevert: boolean;
  revertDisabledReason?: string;
  onConfirmRevert: (reason: string) => void;
  isReverting?: boolean;
  /** When true, opens the revert dialog (e.g. from header Revert button). */
  revertDialogOpen?: boolean;
  onRevertDialogOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ReversibilityPanel({
  reversibleActions,
  canRevert,
  revertDisabledReason,
  onConfirmRevert,
  isReverting = false,
  revertDialogOpen: controlledOpen,
  onRevertDialogOpenChange,
  className,
}: ReversibilityPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? (onRevertDialogOpenChange ?? (() => {})) : setInternalOpen;
  const [reason, setReason] = useState("");

  const list = Array.isArray(reversibleActions) ? reversibleActions : [];
  const hasReversible = list.length > 0;

  const handleConfirm = () => {
    onConfirmRevert(reason || "User-initiated revert");
    setReason("");
    setDialogOpen(false);
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Outcome & Reversibility</CardTitle>
        <p className="text-sm text-muted-foreground">
          Reversible actions and validators; confirmations and roles required to revert.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {!hasReversible ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No reversible actions for this run.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {list.map((action) => (
                <li
                  key={action.actionId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/[0.06] bg-secondary/20 p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{action.type}</p>
                    {action.targetResource != null && (
                      <p className="text-xs text-muted-foreground">
                        Target: {action.targetResource}
                      </p>
                    )}
                    {action.requiredValidators != null &&
                      action.requiredValidators.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Validators: {(action.requiredValidators ?? []).join(", ")}
                        </p>
                      )}
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium",
                      action.status === "reverted"
                        ? "bg-muted text-muted-foreground"
                        : action.status === "approved" || action.status === "passed"
                          ? "bg-teal/20 text-teal"
                          : "bg-amber/20 text-amber"
                    )}
                  >
                    {action.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-amber focus-visible:ring-amber/50"
                onClick={() => setDialogOpen(true)}
                disabled={!canRevert || isReverting}
                title={!canRevert ? revertDisabledReason : undefined}
                aria-label={canRevert ? "Open revert confirmation" : revertDisabledReason ?? "Revert not available"}
              >
                <RotateCcw className="h-4 w-4" />
                {isReverting ? "Reverting…" : "Confirm Revert"}
              </Button>
              {!canRevert && revertDisabledReason != null && (
                <span className="text-xs text-muted-foreground">
                  {revertDisabledReason}
                </span>
              )}
            </div>
          </>
        )}

        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm revert</AlertDialogTitle>
              <AlertDialogDescription>
                This will revert the reversible actions for this run. Provide a reason for the audit trail.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="revert-reason">Reason</Label>
              <Input
                id="revert-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Incorrect configuration applied"
                className="bg-background"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirm Revert
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
