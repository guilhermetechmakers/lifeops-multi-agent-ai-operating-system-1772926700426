import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Lock, Monitor, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  useSessions,
  useRevokeSession,
  useTwoFactor,
  useUpdateTwoFactor,
  useUpdatePassword,
} from "@/hooks/use-profile";
import { AuditTrailPanel } from "@/components/auth/audit-trail-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

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
  const { config: twoFactor, isLoading: twoFactorLoading } = useTwoFactor();
  const revokeSession = useRevokeSession();
  const update2FA = useUpdateTwoFactor();
  const updatePassword = useUpdatePassword();
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

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

  const sessionsList = sessions ?? [];

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
            Add an extra layer of security with 2FA
          </p>
        </CardHeader>
        <CardContent>
          {twoFactorLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
              <div>
                <p className="font-medium text-foreground">Authenticator app (TOTP)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {twoFactor?.enabled ? "2FA is enabled" : "2FA is disabled"}
                </p>
              </div>
              <Switch
                checked={twoFactor?.enabled ?? false}
                onCheckedChange={(v) => update2FA.mutate(v)}
                disabled={update2FA.isPending}
                aria-label="Toggle 2FA"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage devices where you're signed in
          </p>
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
                    <p className="font-medium text-foreground">{session.device}</p>
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
    </div>
  );
}
