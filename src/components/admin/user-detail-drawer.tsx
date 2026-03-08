/**
 * UserDetailDrawer — User profile, roles, sessions, recent audits, impersonation.
 * Shown as a slide-over dialog; impersonation with audit trail note.
 */

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUserSessions, useAuditLogs } from "@/hooks/use-admin";
import type { AdminUser, AdminSession, AuditLog } from "@/types/admin";
import {
  User,
  Shield,
  Monitor,
  FileText,
  UserCog,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onImpersonate?: (userId: string) => void;
  onExportAudit?: (userId: string) => void;
  onRevokeSessions?: (user: AdminUser) => void;
  onAssignRoles?: (user: AdminUser) => void;
}

export function UserDetailDrawer({
  open,
  onOpenChange,
  user,
  onImpersonate,
  onExportAudit,
  onRevokeSessions,
  onAssignRoles,
}: UserDetailDrawerProps) {
  const userId = user?.id ?? null;
  const { sessions = [], isLoading: sessionsLoading } = useUserSessions(userId);
  const { logs = [], isLoading: logsLoading } = useAuditLogs({
    userId: userId ?? undefined,
    limit: 10,
  });

  const sessionList: AdminSession[] = Array.isArray(sessions) ? sessions : [];
  const auditList: AuditLog[] = Array.isArray(logs) ? logs : [];

  const handleImpersonate = useCallback(() => {
    if (userId && onImpersonate) {
      onImpersonate(userId);
      onOpenChange(false);
    }
  }, [userId, onImpersonate, onOpenChange]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] sm:max-w-lg"
        aria-labelledby="user-detail-title"
      >
        <DialogHeader>
          <DialogTitle id="user-detail-title" className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" aria-hidden />
            {user?.name ?? user?.email ?? "User details"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] pr-4">
          <div className="space-y-6">
            {/* Profile */}
            <section aria-labelledby="profile-heading">
              <h3 id="profile-heading" className="mb-2 text-sm font-medium text-muted-foreground">
                Profile
              </h3>
              <div className="rounded-lg border border-white/[0.03] bg-secondary/20 p-3 text-sm">
                <p className="font-medium text-foreground">{user?.name ?? "—"}</p>
                <p className="text-muted-foreground">{user?.email ?? "—"}</p>
                <div className="mt-2">
                  <Badge
                    variant={user?.status === "active" ? "default" : "destructive"}
                    className={cn(
                      user?.status === "active" && "bg-teal/20 text-teal hover:bg-teal/30"
                    )}
                  >
                    {user?.status ?? "—"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Last active: {user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : "—"}
                </p>
              </div>
            </section>

            <Separator className="bg-white/[0.03]" />

            {/* Roles */}
            <section aria-labelledby="roles-heading">
              <h3 id="roles-heading" className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4" />
                Roles
              </h3>
              <div className="flex flex-wrap gap-1">
                {(user?.roles ?? []).length === 0 ? (
                  <span className="text-sm text-muted-foreground">No roles</span>
                ) : (
                  (user?.roles ?? []).map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">
                      {r}
                    </Badge>
                  ))
                )}
              </div>
              {onAssignRoles && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-white/[0.03]"
                  onClick={() => onAssignRoles(user)}
                >
                  Assign roles
                </Button>
              )}
            </section>

            <Separator className="bg-white/[0.03]" />

            {/* Sessions */}
            <section aria-labelledby="sessions-heading">
              <h3 id="sessions-heading" className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Monitor className="h-4 w-4" />
                Active sessions ({sessionList.length})
              </h3>
              {sessionsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : sessionList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active sessions</p>
              ) : (
                <ul className="space-y-2">
                  {(sessionList ?? []).slice(0, 5).map((s) => (
                    <li
                      key={s?.id ?? ""}
                      className="rounded-md border border-white/[0.03] px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-foreground">{s?.device ?? "—"}</span>
                      <span className="ml-2 text-muted-foreground">{s?.ip ?? "—"}</span>
                      <span className="ml-2 text-muted-foreground">
                        {s?.lastUsed ? new Date(s.lastUsed).toLocaleString() : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {onRevokeSessions && sessionList.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-[#FF3B30]/50 text-[#FF3B30] hover:bg-[#FF3B30]/10"
                  onClick={() => onRevokeSessions(user)}
                >
                  Revoke all sessions
                </Button>
              )}
            </section>

            <Separator className="bg-white/[0.03]" />

            {/* Recent audits */}
            <section aria-labelledby="audit-heading">
              <h3 id="audit-heading" className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" />
                Recent audit activity
              </h3>
              {logsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : auditList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <ul className="space-y-2">
                  {(auditList ?? []).map((a) => (
                    <li
                      key={a?.id ?? ""}
                      className="flex justify-between rounded-md border border-white/[0.03] px-3 py-2 text-xs"
                    >
                      <span className="text-foreground">{a?.action ?? "—"}</span>
                      <span className="text-muted-foreground">
                        {a?.timestamp ? new Date(a.timestamp).toLocaleString() : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {onExportAudit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-white/[0.03]"
                  onClick={() => onExportAudit(user?.id ?? "")}
                >
                  Export audit log
                </Button>
              )}
            </section>

            {/* Impersonation */}
            {onImpersonate && (
              <>
                <Separator className="bg-white/[0.03]" />
                <section aria-labelledby="impersonation-heading">
                  <h3 id="impersonation-heading" className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserCog className="h-4 w-4" />
                    Emergency access
                  </h3>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Impersonation is logged and time-bounded. Use only for support or compliance.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber/50 text-amber hover:bg-amber/10"
                    onClick={handleImpersonate}
                  >
                    Impersonate user
                  </Button>
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
