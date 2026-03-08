/**
 * BulkActionToolbar — appears when items selected; Publish, Unpublish, Archive, Export with confirm.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Upload, Download, Archive, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BulkActionType } from "@/types/content-library";

export interface BulkActionToolbarProps {
  selectedCount: number;
  onAction: (action: BulkActionType) => void;
  onClearSelection: () => void;
  isPending?: boolean;
  className?: string;
}

const ACTIONS: { type: BulkActionType; label: string; icon: React.ElementType }[] = [
  { type: "publish", label: "Publish", icon: Upload },
  { type: "unpublish", label: "Unpublish", icon: XCircle },
  { type: "archive", label: "Archive", icon: Archive },
  { type: "export", label: "Export", icon: Download },
];

export function BulkActionToolbar({
  selectedCount,
  onAction,
  onClearSelection,
  isPending = false,
  className,
}: BulkActionToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkActionType | null>(null);

  if (selectedCount === 0) return null;

  const handleClick = (action: BulkActionType) => {
    if (action === "export") {
      onAction(action);
      return;
    }
    setConfirmAction(action);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      onAction(confirmAction);
      setConfirmAction(null);
    }
  };

  const handleCancel = () => setConfirmAction(null);

  return (
    <div className="contents">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-white/[0.03] bg-card px-4 py-2 transition-all duration-200",
          className
        )}
      >
        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-2">
          {(ACTIONS ?? []).map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => handleClick(type)}
              disabled={isPending}
              aria-label={`${label} selected items`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 ml-auto"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          Clear
        </Button>
      </div>
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "publish" && "Publish selected items?"}
              {confirmAction === "unpublish" && "Unpublish selected items?"}
              {confirmAction === "archive" && "Archive selected items?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "publish" &&
                "Selected content will be published to the configured channels."}
              {confirmAction === "unpublish" &&
                "Selected content will be unpublished and reverted to draft."}
              {confirmAction === "archive" &&
                "Selected items will be moved to archive. You can restore them later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Processing…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
