/**
 * Preferences panel: default agent behavior, autopilot settings, notification prefs.
 */

import { Sliders, Bot, Zap } from "lucide-react";
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

export function PreferencesPanel() {
  const { preferences: prefs, isLoading } = usePreferences();
  const update = useUpdatePreferences();

  const preferences = (prefs?.preferences ?? {}) as {
    autopilotEnabled?: boolean;
    defaultAgent?: string;
    notificationPrefs?: { email?: boolean; sms?: boolean; push?: boolean };
    dataExportConsent?: boolean;
  };
  const autopilotEnabled = preferences.autopilotEnabled ?? false;
  const defaultAgent = preferences.defaultAgent ?? "assistant";
  const notificationPrefs = preferences.notificationPrefs ?? {};
  const emailNotif = notificationPrefs.email ?? true;
  const smsNotif = notificationPrefs.sms ?? false;
  const pushNotif = notificationPrefs.push ?? true;
  const dataExportConsent = preferences.dataExportConsent ?? false;

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
    </div>
  );
}
