/**
 * OverrideConflictModal — Human-in-the-loop override with notes.
 * Preserves audit trail.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Conflict } from "@/types/conflicts";

export interface OverrideConflictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: Conflict | null;
  onSubmit: (payload: { outcome: string; notes: string }) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function OverrideConflictModal({
  open,
  onOpenChange,
  conflict,
  onSubmit,
  isSubmitting = false,
  className,
}: OverrideConflictModalProps) {
  const [outcome, setOutcome] = useState("overridden");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onSubmit({ outcome, notes: notes || "Manual override by user" });
    setOutcome("overridden");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-md", className)}
        aria-describedby="override-description"
      >
        <DialogHeader>
          <DialogTitle>Override conflict resolution</DialogTitle>
          <DialogDescription id="override-description">
            Apply a manual override for {conflict?.id ?? "this conflict"}. This will be
            recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="override-outcome">Outcome</Label>
            <Input
              id="override-outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. overridden, deferred"
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="override-notes">Notes (required for audit)</Label>
            <Textarea
              id="override-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for override…"
              className="min-h-[80px] bg-background"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? "Applying…" : "Apply override"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
