/**
 * AutopilotDefaultsCard — Thresholds, modes (suggest-only vs autopilot), safety rails.
 */

import { useState, useEffect } from "react";
import { Zap, Shield, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSettingsGlobal, useUpdateSettingsGlobal } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RBACGuard } from "./rbac-guard";
import type { AutopilotSettings } from "@/types/settings";

const MODE_OPTIONS = [
  { value: "suggest_only", label: "Suggest only" },
  { value: "autopilot", label: "Autopilot" },
] as const;

export function AutopilotDefaultsCard() {
  const { data: global, isLoading } = useSettingsGlobal();
  const update = useUpdateSettingsGlobal();

  const autopilot = global?.autopilot ?? null;
  const mode = autopilot?.mode ?? "suggest_only";
  const safetyRailsEnabled = autopilot?.safety_rails_enabled ?? true;

  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [maxAutoActionsPerDay, setMaxAutoActionsPerDay] = useState(10);
  useEffect(() => {
    if (autopilot?.confidence_threshold != null) setConfidenceThreshold(autopilot.confidence_threshold);
    if (autopilot?.max_auto_actions_per_day != null) setMaxAutoActionsPerDay(autopilot.max_auto_actions_per_day);
  }, [autopilot?.confidence_threshold, autopilot?.max_auto_actions_per_day]);

  const handleModeChange = (value: "suggest_only" | "autopilot") => {
    update.mutate({
      autopilot: {
        ...(autopilot ?? {}),
        mode: value,
        confidence_threshold: autopilot?.confidence_threshold ?? 0.85,
        safety_rails_enabled: autopilot?.safety_rails_enabled ?? true,
        max_auto_actions_per_day: autopilot?.max_auto_actions_per_day ?? 10,
      },
    });
    toast.success("Autopilot mode updated");
  };

  const handleSaveThresholds = () => {
    update.mutate({
      autopilot: {
        ...(autopilot ?? {}),
        mode: autopilot?.mode ?? "suggest_only",
        confidence_threshold: confidenceThreshold,
        safety_rails_enabled: safetyRailsEnabled,
        max_auto_actions_per_day: maxAutoActionsPerDay,
      },
    });
    toast.success("Safety settings saved");
  };

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <RBACGuard roles={["admin", "member"]}>
    <Card className="border-white/[0.03] bg-card card-health transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-muted-foreground" />
          Autopilot defaults
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automation behavior, confidence thresholds, and safety rails
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Mode
          </h4>
          <div className="flex flex-wrap gap-2">
            {(MODE_OPTIONS ?? []).map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={mode === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleModeChange(opt.value)}
                className={mode === opt.value ? "" : "border-white/[0.03]"}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Suggest only: agent proposes changes for your approval. Autopilot: agent can apply safe
            actions within limits.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety rails
          </h4>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div>
              <p className="font-medium text-foreground">Require approval for destructive actions</p>
              <p className="text-xs text-muted-foreground">Always confirm before destructive changes</p>
            </div>
            <Switch
              checked={safetyRailsEnabled}
              onCheckedChange={(v) => {
                const next: AutopilotSettings = {
                  mode: autopilot?.mode === "autopilot" ? "autopilot" : "suggest_only",
                  confidence_threshold: autopilot?.confidence_threshold ?? 0.85,
                  safety_rails_enabled: v,
                  max_auto_actions_per_day: autopilot?.max_auto_actions_per_day ?? 10,
                };
                update.mutate({ autopilot: next });
              }}
              aria-label="Toggle safety rails"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence threshold (0–1)</Label>
              <Input
                id="confidence"
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={confidenceThreshold}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!Number.isNaN(v)) setConfidenceThreshold(v);
                }}
                className="bg-secondary border-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-actions">Max auto actions per day</Label>
              <Input
                id="max-actions"
                type="number"
                min={1}
                max={100}
                value={maxAutoActionsPerDay}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!Number.isNaN(v)) setMaxAutoActionsPerDay(v);
                }}
                className="bg-secondary border-white/[0.03]"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleSaveThresholds}>
            Save thresholds
          </Button>
        </div>
      </CardContent>
    </Card>
    </RBACGuard>
  );
}
