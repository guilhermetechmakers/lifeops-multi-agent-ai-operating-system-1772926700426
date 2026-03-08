import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Lock, Monitor, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
  useTwoFactor,
  useTwoFactorDisable,
  useUpdatePassword,
} from "@/hooks/use-profile";
import { AuditTrailPanel } from "@/components/auth/audit-trail-panel";
import { TwoFactorSetupModal } from "./two-factor-setup-modal";
import { getPasswordStrength } from "@/lib/password-strength";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function SecurityPanel() {
  const { items: sessions, isLoading: sessionsLoading } = useSessions();
  const { config: twoFactor, isLoading: twoFactorLoading, refetch: refetchTwoFactor } = useTwoFactor();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();
  const disable2FA = useTwoFactorDisable();
  const updatePassword = useUpdatePassword();
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [disable2FAOpen, setDisable2FAOpen] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState("");

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = form.handleSubmit((data) => {
    updatePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => form.reset(),
      }
    );
  });

  const sessionsList = Array.isArray(sessions) ? sessions : [];
  const newPassword = form.watch("newPassword") ?? "";
  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const handleDisable2FA = () => {
    if (!disable2FAPassword.trim()) return;
    disable2FA.mutate(
      { password: disable2FAPassword },
      {
        onSuccess: () => {
          setDisable2FAOpen(false);
          setDisable2FAPassword("");
          refetchTwoFactor();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPasswordSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...form.register("currentPassword")}
                className="bg-input border-white/[0.03]"
              />
              {form.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                {...form.register("newPassword")}
                className="bg-input border-white/[0.03]"
              />
              {newPassword.length > 0 && (
                <div className="flex items-center gap-2" role="status" aria-live="polite">
                  <div className="flex gap-0.5 flex-1 max-w-[120px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          i <= passwordStrength.level
                            ? passwordStrength.level <= 1
                              ? "bg-destructive"
                              : passwordStrength.level <= 2
                                ? "bg-amber-500"
                                : "bg-green-500"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                </div>
              )}
              {form.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register("confirmPassword")}
                className="bg-input border-white/[0.03]"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={updatePassword.isPending}>
              {updatePassword.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security with TOTP (authenticator app)
          </p>
        </CardHeader>
        <CardContent>
          {twoFactorLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
              <div>
                <p className="font-medium text-foreground">Authenticator app (TOTP)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {twoFactor?.enabled ? "2FA is enabled" : "2FA is disabled"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {twoFactor?.enabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setDisable2FAOpen(true)}
                    disabled={disable2FA.isPending}
                    aria-label="Disable two-factor authentication"
                  >
                    Disable 2FA
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setSetup2FAOpen(true)}
                    aria-label="Enable two-factor authentication"
                  >
                    Enable 2FA
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TwoFactorSetupModal
        open={setup2FAOpen}
        onOpenChange={setSetup2FAOpen}
        onSuccess={() => {
          refetchTwoFactor();
        }}
      />

      <AlertDialog open={disable2FAOpen} onOpenChange={(o) => { setDisable2FAOpen(o); if (!o) setDisable2FAPassword(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable 2FA?</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your password to disable two-factor authentication. Your account will be less secure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="disable-2fa-password">Password</Label>
            <Input
              id="disable-2fa-password"
              type="password"
              value={disable2FAPassword}
              onChange={(e) => setDisable2FAPassword(e.target.value)}
              className="mt-2 bg-input border-white/[0.03]"
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable2FA}
              disabled={disable2FA.isPending || !disable2FAPassword.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disable2FA.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable 2FA"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage devices where you&apos;re signed in
            </p>
          </div>
          {sessionsList.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setRevokeAllOpen(true)}
              disabled={revokeAllSessions.isPending}
            >
              Revoke all
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : sessionsList.length > 0 ? (
            <div className="space-y-3">
              {sessionsList.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{session.device}</p>
                      {session.current && (
                        <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          Current session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                      {session.ip && ` · ${session.ip}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevokeTarget(session.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          )}
        </CardContent>
      </Card>

      <AuditTrailPanel currentUserOnly limit={8} />

      <AlertDialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out that device. The user will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeTarget) {
                  revokeSession.mutate(revokeTarget);
                  setRevokeTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out on all devices. You will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                revokeAllSessions.mutate(undefined, {
                  onSuccess: () => {
                    setRevokeAllOpen(false);
                    window.location.href = "/auth";
                  },
                });
              }}
              disabled={revokeAllSessions.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeAllSessions.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
