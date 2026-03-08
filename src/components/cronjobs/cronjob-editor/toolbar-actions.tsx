/**
 * ToolbarActions: Save, Enable/Disable, Duplicate, Delete, Validate, Dry-run, Quick Test.
 */

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";
import {
  Save,
  Play,
  Copy,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface ToolbarActionsProps {
  isNew: boolean;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  onSave: () => void | Promise<void>;
  onValidate: () => void | Promise<void>;
  onDryRun: () => void | Promise<void>;
  onRunNow: () => void | Promise<void>;
  onDuplicate: () => void;
  onDelete: () => void | Promise<void>;
  isSaving?: boolean;
  isValidating?: boolean;
  isDryRunning?: boolean;
  isRunning?: boolean;
  isValid?: boolean;
  className?: string;
}

export function ToolbarActions({
  isNew,
  enabled,
  onEnabledChange,
  onSave,
  onValidate,
  onDryRun,
  onRunNow,
  onDuplicate,
  onDelete,
  isSaving = false,
  isValidating = false,
  isDryRunning = false,
  isRunning = false,
  isValid = true,
  className,
}: ToolbarActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Enabled</span>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => void onSave()}
          disabled={isSaving || !isValid}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isNew ? "Create" : "Save"}
        </Button>

        {!isNew && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void onValidate()}
              disabled={isValidating}
              className="gap-2"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Validate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void onDryRun()}
              disabled={isDryRunning}
              className="gap-2"
            >
              {isDryRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Dry run
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void onRunNow()}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Quick test
            </Button>
          </>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDuplicate}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </Button>

        {!isNew && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cronjob?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The cronjob will be permanently removed.
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
    </div>
  );
}
