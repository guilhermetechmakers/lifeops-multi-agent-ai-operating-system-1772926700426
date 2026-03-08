/**
 * PermissionsAutomationControl: Permission level, automation mode, and bounds.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CronjobAutomationBounds, AutomationLevel, PermissionsLevel } from "@/types/cronjob";

export interface PermissionsAutomationControlProps {
  permissionsLevel: PermissionsLevel;
  automationLevel: AutomationLevel;
  automationBounds?: CronjobAutomationBounds | null;
  onPermissionsChange: (v: PermissionsLevel) => void;
  onAutomationChange: (v: AutomationLevel) => void;
  onBoundsChange: (v: CronjobAutomationBounds) => void;
  className?: string;
  disabled?: boolean;
}

const PERMISSIONS_OPTIONS: { value: PermissionsLevel; label: string }[] = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

const AUTOMATION_OPTIONS: { value: AutomationLevel; label: string; desc: string }[] = [
  { value: "suggest-only", label: "Suggest only", desc: "AI suggests; user approves every action." },
  { value: "approval-required", label: "Approval required", desc: "Runs require explicit approval before execution." },
  { value: "auto-execute", label: "Auto execute", desc: "Runs execute automatically within bounds." },
  { value: "bounded-autopilot", label: "Bounded autopilot", desc: "Auto with strict limits (max actions, spend)." },
];

export function PermissionsAutomationControl({
  permissionsLevel,
  automationLevel,
  automationBounds = {},
  onPermissionsChange,
  onAutomationChange,
  onBoundsChange,
  className,
  disabled,
}: PermissionsAutomationControlProps) {
  const bounds = automationBounds ?? {};
  const showBounds =
    automationLevel === "auto-execute" || automationLevel === "bounded-autopilot";

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Permissions level</Label>
        <select
          value={permissionsLevel ?? "editor"}
          onChange={(e) => onPermissionsChange(e.target.value as PermissionsLevel)}
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-white/[0.03] bg-input px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Permissions level"
        >
          {(PERMISSIONS_OPTIONS ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Automation mode</Label>
        <div className="space-y-3">
          {(AUTOMATION_OPTIONS ?? []).map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-lg border border-white/[0.03] bg-secondary/30 px-4 py-3 transition-colors",
                automationLevel === opt.value && "border-primary/50 bg-primary/5",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="radio"
                name="automation"
                value={opt.value}
                checked={automationLevel === opt.value}
                onChange={() => onAutomationChange(opt.value)}
                disabled={disabled}
                className="h-4 w-4 accent-primary"
                aria-label={opt.label}
              />
              <div>
                <span className="text-sm font-medium">{opt.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {showBounds && (
        <div className="space-y-4 rounded-lg border border-white/[0.03] bg-secondary/20 p-4">
          <Label className="text-sm font-medium">Automation bounds</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bounds-max-actions" className="text-xs text-muted-foreground">
                Max actions per run
              </Label>
              <Input
                id="bounds-max-actions"
                type="number"
                min={0}
                value={bounds.maxActions ?? ""}
                onChange={(e) => {
                  const n = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                  onBoundsChange({ ...bounds, maxActions: Number.isNaN(n) ? undefined : n });
                }}
                placeholder="e.g. 10"
                disabled={disabled}
                className="bg-input border-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bounds-spend" className="text-xs text-muted-foreground">
                Spend limit (units)
              </Label>
              <Input
                id="bounds-spend"
                type="number"
                min={0}
                value={bounds.spendLimit ?? ""}
                onChange={(e) => {
                  const n = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                  onBoundsChange({ ...bounds, spendLimit: Number.isNaN(n) ? undefined : n });
                }}
                placeholder="e.g. 100"
                disabled={disabled}
                className="bg-input border-white/[0.03]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bounds-tools" className="text-xs text-muted-foreground">
              Allowed tools (comma-separated)
            </Label>
            <Input
              id="bounds-tools"
              value={(bounds.allowedTools ?? []).join(", ")}
              onChange={(e) => {
                const s = e.target.value ?? "";
                const list = s
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                onBoundsChange({ ...bounds, allowedTools: list });
              }}
              placeholder="tool1, tool2"
              disabled={disabled}
              className="bg-input border-white/[0.03]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
