/**
 * Preferences panel: default agent behavior, autopilot settings, notification prefs.
 */

import { Sliders, Bot, Zap, Layers, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";

const AGENT_OPTIONS = [
  { value: "assistant", label: "Assistant" },
  { value: "minimal", label: "Minimal" },
  { value: "proactive", label: "Proactive" },
] as const;

const MODULE_OPTIONS = [
  { id: "cronjobs", label: "Cronjobs & automation" },
  { id: "content", label: "Content library" },
  { id: "finance", label: "Finance & billing" },
  { id: "health", label: "Health tracking" },
  { id: "analytics", label: "Analytics & reports" },
] as const;

export function PreferencesPanel() {
  const { preferences: prefs, isLoading } = usePreferences();
  const update = useUpdatePreferences();

  const preferences = (prefs?.preferences ?? {}) as {
    autopilotEnabled?: boolean;
    defaultAgent?: string;
    notificationPrefs?: { email?: boolean; sms?: boolean; push?: boolean };
    dataExportConsent?: boolean;
    modulePreferences?: Record<string, { enabled: boolean; settings?: Record<string, unknown> }>;
  };
  const autopilotEnabled = preferences.autopilotEnabled ?? false;
  const defaultAgent = preferences.defaultAgent ?? "assistant";
  const notificationPrefs = preferences.notificationPrefs ?? {};
  const emailNotif = notificationPrefs.email ?? true;
  const smsNotif = notificationPrefs.sms ?? false;
  const pushNotif = notificationPrefs.push ?? true;
  const dataExportConsent = preferences.dataExportConsent ?? false;
  const modulePrefsMap = preferences.modulePreferences ?? {};
  const modulePrefs = MODULE_OPTIONS.map((opt) => ({
    moduleName: opt.label,
    id: opt.id,
    enabled: modulePrefsMap[opt.id]?.enabled ?? true,
  }));

  const handleAutopilotChange = (v: boolean) => {
    update.mutate({ autopilotEnabled: v });
  };

  const handleDefaultAgentChange = (value: string) => {
    update.mutate({ defaultAgent: value });
  };

  const handleNotificationChange = (key: "email" | "sms" | "push", value: boolean) => {
    update.mutate({
      notificationPrefs: {
        email: key === "email" ? value : emailNotif,
        sms: key === "sms" ? value : smsNotif,
        push: key === "push" ? value : pushNotif,
      },
    });
  };

  const handleDataExportChange = (v: boolean) => {
    update.mutate({ dataExportConsent: v });
  };

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    const map = { ...modulePrefsMap, [moduleId]: { enabled, settings: modulePrefsMap[moduleId]?.settings } };
    update.mutate({ modulePreferences: map });
  };

  const handleResetToDefaults = () => {
    update.mutate({
      modulePreferences: {},
      autopilotEnabled: false,
      defaultAgent: "assistant",
      notificationPrefs: { email: true, sms: false, push: true },
      dataExportConsent: false,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Default agent behavior
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            How the default agent should behave in the dashboard
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AGENT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={defaultAgent === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleDefaultAgentChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Autopilot
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Let the system take safe automated actions within limits
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div>
              <p className="font-medium text-foreground">Enable autopilot</p>
              <p className="text-xs text-muted-foreground mt-1">
                Automate routine tasks with safety rails
              </p>
            </div>
            <Switch
              checked={autopilotEnabled}
              onCheckedChange={handleAutopilotChange}
              disabled={update.isPending}
              aria-label="Toggle autopilot"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Notifications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            How you want to receive updates
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <Label htmlFor="pref-email" className="cursor-pointer flex-1">
              Email
            </Label>
            <Switch
              id="pref-email"
              checked={emailNotif}
              onCheckedChange={(v) => handleNotificationChange("email", v)}
              disabled={update.isPending}
              aria-label="Email notifications"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <Label htmlFor="pref-sms" className="cursor-pointer flex-1">
              SMS
            </Label>
            <Switch
              id="pref-sms"
              checked={smsNotif}
              onCheckedChange={(v) => handleNotificationChange("sms", v)}
              disabled={update.isPending}
              aria-label="SMS notifications"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <Label htmlFor="pref-push" className="cursor-pointer flex-1">
              Push
            </Label>
            <Switch
              id="pref-push"
              checked={pushNotif}
              onCheckedChange={(v) => handleNotificationChange("push", v)}
              disabled={update.isPending}
              aria-label="Push notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Data export</CardTitle>
          <p className="text-sm text-muted-foreground">
            Allow exporting your data for portability
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div>
              <p className="font-medium text-foreground">Consent to data export</p>
              <p className="text-xs text-muted-foreground mt-1">
                Enable self-service data export
              </p>
            </div>
            <Switch
              checked={dataExportConsent}
              onCheckedChange={handleDataExportChange}
              disabled={update.isPending}
              aria-label="Data export consent"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Module preferences
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enable or disable features per module
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={update.isPending}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset to defaults
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(modulePrefs ?? []).map((mod) => (
            <div
              key={mod.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4"
            >
              <div>
                <p className="font-medium text-foreground">{mod.moduleName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {mod.enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <Switch
                checked={mod.enabled}
                onCheckedChange={(v) => handleModuleToggle(mod.id, v)}
                disabled={update.isPending}
                aria-label={`Toggle ${mod.moduleName}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
