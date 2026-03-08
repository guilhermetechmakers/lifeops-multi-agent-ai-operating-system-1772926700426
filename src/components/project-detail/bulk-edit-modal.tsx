/**
 * BulkEditModal — apply bulk updates to selected items.
 */

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface BulkEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fieldLabel: string;
  options: { value: string; label: string }[];
  onApply: (status: string) => void;
  selectedCount: number;
}

export function BulkEditModal({
  open,
  onOpenChange,
  title,
  fieldLabel,
  options,
  onApply,
  selectedCount,
}: BulkEditModalProps) {
  const [status, setStatus] = useState<string>("");

  const handleSubmit = useCallback(() => {
    if (!status) return;
    onApply(status);
    setStatus("");
    onOpenChange(false);
  }, [status, onApply, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/[0.03] bg-[#151718]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{selectedCount} items selected</p>
          <div>
            <Label>{fieldLabel}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1 border-white/[0.03]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!status}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
