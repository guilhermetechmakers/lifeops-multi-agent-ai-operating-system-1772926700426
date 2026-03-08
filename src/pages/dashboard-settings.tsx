import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Mail,
  Smartphone,
  Clock,
  Moon,
  FileText,
  Eye,
  Save,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AnimatedPage } from "@/components/animated-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useTemplatesList,
} from "@/hooks/use-notifications";
import type { NotificationPreferences, DigestFrequency } from "@/types/notification";
import { cn } from "@/lib/utils";

const DIGEST_OPTIONS: { value: DigestFrequency; label: string }[] = [
  { value: "immediate", label: "Immediate" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const MOCK_USER_ID = "user-1";

function NotificationChannelsSettings() {
  const { data: prefs, isLoading } = useNotificationPreferences(MOCK_USER_ID);
  const update = useUpdateNotificationPreferences(MOCK_USER_ID);

  const [local, setLocal] = useState<Partial<NotificationPreferences>>({});

  const current = { ...prefs, ...local } as NotificationPreferences;
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
        in_app: inApp,
        email: email,
        push: push,
        digest_enabled: digestEnabled,
        digest_frequency: digestFrequency,
        quiet_hours_start: quietStart,
        quiet_hours_end: quietEnd,
      },
      {
        onSuccess: () => setLocal({}),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-secondary rounded" />
        <div className="h-10 bg-secondary rounded" />
        <div className="h-10 bg-secondary rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Channel preferences
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">In-app</p>
                <p className="text-xs text-muted-foreground">
                  Notifications in the dashboard
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Via SendGrid
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Via Firebase Cloud Messaging
                </p>
              </div>
            </div>
            <Switch
              checked={push}
              onCheckedChange={(v) => setLocal((p) => ({ ...p, push: v }))}
              aria-label="Toggle push notifications"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Digest schedule
        </h4>
        <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
          <div>
            <p className="font-medium text-foreground">Batch notifications</p>
            <p className="text-xs text-muted-foreground">
              Group notifications into digest emails
            </p>
          </div>
          <Switch
            checked={digestEnabled}
            onCheckedChange={(v) =>
              setLocal((p) => ({ ...p, digest_enabled: v }))
            }
            aria-label="Toggle digest"
          />
        </div>
        {digestEnabled && (
          <div className="space-y-2">
            <Label>Digest frequency</Label>
            <div className="flex flex-wrap gap-2">
              {DIGEST_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setLocal((p) => ({ ...p, digest_frequency: opt.value }))
                  }
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    digestFrequency === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
              onChange={(e) =>
                setLocal((p) => ({ ...p, quiet_hours_start: e.target.value }))
              }
              className="bg-secondary border-0"
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="quiet-end">End</Label>
            <Input
              id="quiet-end"
              type="time"
              value={quietEnd}
              onChange={(e) =>
                setLocal((p) => ({ ...p, quiet_hours_end: e.target.value }))
              }
              className="bg-secondary border-0"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={update.isPending || Object.keys(local).length === 0}
        className="bg-primary hover:bg-primary/90"
      >
        <Save className="mr-2 h-4 w-4" />
        Save preferences
      </Button>
    </div>
  );
}

function SnoozeRulesSettings() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Snooze rules defer notifications for a configured duration. Default
        snooze options: 1h, 4h, 24h.
      </p>
      <div className="rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Default snooze duration</p>
            <p className="text-xs text-muted-foreground">
              1 hour — change in template or per-notification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesEditorSettings() {
  const { items: templates } = useTemplatesList();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const safeTemplates = Array.isArray(templates) ? templates : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Notification templates support variables like {"{{cronjob_name}}"},{" "}
        {"{{agent}}"}, {"{{run_id}}"} and localization keys.
      </p>
      {safeTemplates.length > 0 ? (
        <div className="space-y-2">
          {safeTemplates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.locale} · {t.variables?.length ?? 0} variables
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setPreviewTemplate(previewTemplate === t.id ? null : t.id)
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No custom templates. System templates are used by default.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DashboardSettings() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Notifications, privacy, team & RBAC, autopilot defaults
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">Account details</p>
                </div>
                <Link to="/dashboard/profile">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                    Full profile
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-input"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <CardTitle>Notification channels</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure in-app, email, and push preferences
              </p>
            </CardHeader>
            <CardContent>
              <NotificationChannelsSettings />
            </CardContent>
          </Card>
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <CardTitle>Snooze rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Default duration and conditions for deferring notifications
              </p>
            </CardHeader>
            <CardContent>
              <SnoozeRulesSettings />
            </CardContent>
          </Card>
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Notification templates with variables and localization
              </p>
            </CardHeader>
            <CardContent>
              <TemplatesEditorSettings />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <p className="text-sm text-muted-foreground">
                GitHub, Stripe, Plaid, Health APIs
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect and manage adapters from the integrations page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AnimatedPage>
  );
}
