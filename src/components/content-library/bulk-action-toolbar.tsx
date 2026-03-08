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
import { Upload, Download, Archive, XCircle, Sparkles, RefreshCw, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BulkActionType } from "@/types/content-library";

export interface BulkActionToolbarProps {
  selectedCount: number;
  onAction: (action: BulkActionType) => void;
  onClearSelection: () => void;
  isPending?: boolean;
  className?: string;
}

const ACTIONS: { type: BulkActionType; label: string; icon: React.ElementType; confirm?: boolean }[] = [
  { type: "publish", label: "Publish", icon: Upload, confirm: true },
  { type: "unpublish", label: "Unpublish", icon: XCircle, confirm: true },
  { type: "archive", label: "Archive", icon: Archive, confirm: true },
  { type: "move-to-draft", label: "Move to draft", icon: FileEdit, confirm: true },
  { type: "re-run-llm", label: "Re-run LLM", icon: Sparkles, confirm: true },
  { type: "schedule-republish", label: "Schedule re-publish", icon: RefreshCw, confirm: true },
  { type: "export", label: "Export", icon: Download, confirm: false },
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
    const needsConfirm = ACTIONS.find((a) => a.type === action)?.confirm !== false;
    if (!needsConfirm) {
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
              {confirmAction === "move-to-draft" && "Move to draft?"}
              {confirmAction === "re-run-llm" && "Re-run LLM drafting?"}
              {confirmAction === "schedule-republish" && "Schedule re-publish?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "publish" &&
                "Selected content will be published to the configured channels."}
              {confirmAction === "unpublish" &&
                "Selected content will be unpublished and reverted to draft."}
              {confirmAction === "archive" &&
                "Selected items will be moved to archive. You can restore them later."}
              {confirmAction === "move-to-draft" &&
                "Selected items will be reverted to draft status."}
              {confirmAction === "re-run-llm" &&
                "LLM drafting will be re-run for selected items. This may take a moment."}
              {confirmAction === "schedule-republish" &&
                "Selected items will be scheduled for re-publishing."}
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
