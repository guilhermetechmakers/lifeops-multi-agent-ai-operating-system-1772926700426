/**
 * ConstraintsSafetyRailEditor: Max actions, spend limits, confirmations, safety rails.
 */

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Shield, Plus, X } from "lucide-react";
import type { CronjobConstraints, CronjobSafetyRails } from "@/types/cronjob";

export interface ConstraintsSafetyRailEditorProps {
  constraints?: CronjobConstraints | null;
  safetyRails?: string[];
  safetyRailsConfig?: CronjobSafetyRails | null;
  onConstraintsChange: (v: CronjobConstraints) => void;
  onSafetyRailsChange: (v: string[]) => void;
  onSafetyRailsConfigChange: (v: CronjobSafetyRails) => void;
  className?: string;
  disabled?: boolean;
}

export function ConstraintsSafetyRailEditor({
  constraints = {},
  safetyRails = [],
  safetyRailsConfig = {},
  onConstraintsChange,
  onSafetyRailsChange,
  onSafetyRailsConfigChange,
  className,
  disabled,
}: ConstraintsSafetyRailEditorProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [newRail, setNewRail] = useState("");
  const c = constraints ?? {};
  const rails = Array.isArray(safetyRails) ? safetyRails : [];
  const config = safetyRailsConfig ?? {};

  const addRail = useCallback(() => {
    const t = (newRail ?? "").trim();
    if (!t || rails.includes(t)) return;
    onSafetyRailsChange([...rails, t]);
    setNewRail("");
  }, [newRail, rails, onSafetyRailsChange]);

  const removeRail = useCallback(
    (item: string) => {
      onSafetyRailsChange(rails.filter((r) => r !== item));
    },
    [rails, onSafetyRailsChange]
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        <Label className="text-sm font-medium">Constraints</Label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="constraint-max-actions" className="text-xs text-muted-foreground">
            Max actions per run
          </Label>
          <Input
            id="constraint-max-actions"
            type="number"
            min={0}
            value={c.maxActions ?? ""}
            onChange={(e) => {
              const n = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
              onConstraintsChange({ ...c, maxActions: Number.isNaN(n) ? undefined : n });
            }}
            placeholder="Optional"
            disabled={disabled}
            className="bg-input border-white/[0.03]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="constraint-spend" className="text-xs text-muted-foreground">
            Spend limit
          </Label>
          <Input
            id="constraint-spend"
            type="number"
            min={0}
            value={c.spendLimit ?? ""}
            onChange={(e) => {
              const n = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
              onConstraintsChange({ ...c, spendLimit: Number.isNaN(n) ? undefined : n });
            }}
            placeholder="Optional"
            disabled={disabled}
            className="bg-input border-white/[0.03]"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="constraint-tools" className="text-xs text-muted-foreground">
          Allowed tools (comma-separated)
        </Label>
        <Input
          id="constraint-tools"
          value={(c.allowedTools ?? []).join(", ")}
          onChange={(e) => {
            const s = e.target.value ?? "";
            const list = s.split(",").map((t) => t.trim()).filter(Boolean);
            onConstraintsChange({ ...c, allowedTools: list });
          }}
          placeholder="Optional"
          disabled={disabled}
          className="bg-input border-white/[0.03]"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Required confirmations</Label>
          <p className="text-xs text-muted-foreground mt-0.5">User must confirm before run</p>
        </div>
        <Switch
          checked={Boolean(c.requiredConfirmations)}
          onCheckedChange={(checked) =>
            onConstraintsChange({ ...c, requiredConfirmations: checked })
          }
          disabled={disabled}
          aria-label="Required confirmations"
        />
      </div>

      <div className="border-t border-white/[0.03] pt-6 space-y-4">
        <Label className="text-sm font-medium">Safety rails (tags)</Label>
        <div className="flex flex-wrap gap-2">
          {(rails ?? []).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-white/[0.03] bg-secondary/50 px-3 py-1 text-xs"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeRail(item)}
                  className="rounded-full p-0.5 hover:bg-secondary"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newRail}
            onChange={(e) => setNewRail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRail())}
            placeholder="Add safety rail"
            disabled={disabled}
            className="bg-input border-white/[0.03] flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addRail} disabled={disabled}>
            <Plus className="h-4 w-4" />
          </Button>
          {(rails ?? []).length > 0 && !disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmClear(true)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label="Clear all safety rails"
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Manual review required</Label>
          </div>
          <Switch
            checked={Boolean(config.manualReviewRequired)}
            onCheckedChange={(checked) =>
              onSafetyRailsConfigChange({ ...config, manualReviewRequired: checked })
            }
            disabled={disabled}
            aria-label="Manual review required"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="safety-confirmations" className="text-xs text-muted-foreground">
            Min confirmations count
          </Label>
          <Input
            id="safety-confirmations"
            type="number"
            min={0}
            value={config.confirmations ?? ""}
            onChange={(e) => {
              const n = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
              onSafetyRailsConfigChange({
                ...config,
                confirmations: Number.isNaN(n) ? undefined : n,
              });
            }}
            placeholder="0"
            disabled={disabled}
            className="bg-input border-white/[0.03] w-24"
          />
        </div>
      </div>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear safety rails?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all safety rail tags. You can add them back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onSafetyRailsChange([]);
                setConfirmClear(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
