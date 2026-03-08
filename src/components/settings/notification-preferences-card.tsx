/**
 * NotificationPreferencesCard — Per-channel toggles (email, push, in-app).
 * Data from settings API; guarded for null/undefined.
 */

import { useState } from "react";
import { Bell, Mail, Smartphone, Moon, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSettingsGlobal, useUpdateSettingsGlobal } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import type { NotificationPreferences } from "@/types/settings";
import { cn } from "@/lib/utils";

const DIGEST_OPTIONS: { value: "immediate" | "daily" | "weekly" | "monthly"; label: string }[] = [
  { value: "immediate", label: "Immediate" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function NotificationPreferencesCard() {
  const { data: global, isLoading } = useSettingsGlobal();
  const update = useUpdateSettingsGlobal();
  const [local, setLocal] = useState<Partial<NotificationPreferences>>({});

  const prefs = global?.notification_preferences ?? ({} as NotificationPreferences);
  const current = { ...prefs, ...local };
  const inApp = current.in_app ?? true;
  const email = current.email ?? true;
  const push = current.push ?? false;
  const digestEnabled = current.digest_enabled ?? false;
  const digestFrequency = current.digest_frequency ?? "daily";
  const quietStart = current.quiet_hours_start ?? "22:00";
  const quietEnd = current.quiet_hours_end ?? "08:00";

  const handleSave = () => {
    update.mutate(
      {
        notification_preferences: {
          ...prefs,
          in_app: inApp,
          email,
          push,
          digest_enabled: digestEnabled,
          digest_frequency: digestFrequency,
          quiet_hours_start: quietStart,
          quiet_hours_end: quietEnd,
        },
      },
      { onSuccess: () => setLocal({}) }
    );
  };

  const hasChanges =
    local.in_app !== undefined ||
    local.email !== undefined ||
    local.push !== undefined ||
    local.digest_enabled !== undefined ||
    local.digest_frequency !== undefined ||
    local.quiet_hours_start !== undefined ||
    local.quiet_hours_end !== undefined;

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
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          Notification preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure email, push, and in-app notification channels
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">In-app</p>
                <p className="text-xs text-muted-foreground">Notifications in the dashboard</p>
              </div>
            </div>
            <Switch
              checked={inApp}
              onCheckedChange={(v) => setLocal((p) => ({ ...p, in_app: v }))}
              aria-label="Toggle in-app notifications"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-xs text-muted-foreground">Via email</p>
              </div>
            </div>
            <Switch
              checked={email}
              onCheckedChange={(v) => setLocal((p) => ({ ...p, email: v }))}
              aria-label="Toggle email notifications"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Push</p>
                <p className="text-xs text-muted-foreground">Push notifications</p>
              </div>
            </div>
            <Switch
              checked={push}
              onCheckedChange={(v) => setLocal((p) => ({ ...p, push: v }))}
              aria-label="Toggle push notifications"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Digest schedule</h4>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div>
              <p className="font-medium text-foreground">Batch notifications</p>
              <p className="text-xs text-muted-foreground">Group into digest emails</p>
            </div>
            <Switch
              checked={digestEnabled}
              onCheckedChange={(v) => setLocal((p) => ({ ...p, digest_enabled: v }))}
              aria-label="Toggle digest"
            />
          </div>
          {digestEnabled && (
            <div className="flex flex-wrap gap-2">
              {(DIGEST_OPTIONS ?? []).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocal((p) => ({ ...p, digest_frequency: opt.value }))}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                    digestFrequency === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Quiet hours
          </h4>
          <p className="text-xs text-muted-foreground">
            No push/email during these hours (in-app still works)
          </p>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="quiet-start">Start</Label>
              <Input
                id="quiet-start"
                type="time"
                value={quietStart}
                onChange={(e) => setLocal((p) => ({ ...p, quiet_hours_start: e.target.value }))}
                className="bg-secondary border-white/[0.03]"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="quiet-end">End</Label>
              <Input
                id="quiet-end"
                type="time"
                value={quietEnd}
                onChange={(e) => setLocal((p) => ({ ...p, quiet_hours_end: e.target.value }))}
                className="bg-secondary border-white/[0.03]"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={update.isPending || !hasChanges}
          className="bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02]"
        >
          <Save className="mr-2 h-4 w-4" />
          Save preferences
        </Button>
      </CardContent>
    </Card>
  );
}
