/**
 * BulkActionsBar: multi-select controls and bulk operations.
 */

import { Button } from "@/components/ui/button";
import { Play, Power, PowerOff, Trash2 } from "lucide-react";
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
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BulkActionsBarProps {
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onRunNow: () => void;
  onDelete: () => void;
  isPending?: boolean;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  onEnable,
  onDisable,
  onRunNow,
  onDelete,
  isPending = false,
  className,
}: BulkActionsBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) return null;

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.03] bg-secondary/50 px-4 py-3",
          className
        )}
      >
        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEnable}
            disabled={isPending}
            className="gap-2 transition-transform hover:scale-[1.02]"
          >
            <Power className="h-4 w-4" />
            Enable
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDisable}
            disabled={isPending}
            className="gap-2 transition-transform hover:scale-[1.02]"
          >
            <PowerOff className="h-4 w-4" />
            Disable
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRunNow}
            disabled={isPending}
            className="gap-2 transition-transform hover:scale-[1.02]"
          >
            <Play className="h-4 w-4" />
            Run now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            className="gap-2 text-destructive transition-transform hover:scale-[1.02] hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} cronjob(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected cronjobs will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
