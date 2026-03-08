/**
 * SessionListPanel — Per-user session list with revoke all / revoke one.
 * Shows device, IP, last used; bulk and individual revoke actions.
 */

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserSessions, useRevokeUserSessions } from "@/hooks/use-admin";
import type { AdminUser, AdminSession } from "@/types/admin";
import { Monitor, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SessionListPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSuccess?: () => void;
}

export function SessionListPanel({
  open,
  onOpenChange,
  user,
  onSuccess,
}: SessionListPanelProps) {
  const userId = user?.id ?? null;
  const { sessions = [], isLoading } = useUserSessions(userId);
  const revoke = useRevokeUserSessions();

  const sessionList: AdminSession[] = Array.isArray(sessions) ? sessions : [];

  const handleRevokeAll = useCallback(async () => {
    if (!userId) return;
    await revoke.mutateAsync({ userId });
    onSuccess?.();
    onOpenChange(false);
  }, [userId, revoke, onSuccess, onOpenChange]);

  const handleRevokeOne = useCallback(
    async (sessionId: string) => {
      if (!userId) return;
      await revoke.mutateAsync({ userId, sessionId });
      onSuccess?.();
    },
    [userId, revoke, onSuccess]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] sm:max-w-lg"
        aria-labelledby="session-list-title"
        aria-describedby="session-list-description"
      >
        <DialogHeader>
          <DialogTitle id="session-list-title" className="text-foreground">
            Sessions · {user?.name ?? user?.email ?? "User"}
          </DialogTitle>
          <p id="session-list-description" className="text-sm text-muted-foreground">
            Active sessions; revoke all or individual sessions.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            </div>
          ) : (sessionList ?? []).length === 0 ? (
            <div className="rounded-lg border border-white/[0.03] bg-secondary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No active sessions
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {(sessionList ?? []).map((s) => (
                <li
                  key={s?.id ?? ""}
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-white/[0.03] px-3 py-2 transition-colors duration-200 hover:bg-secondary/30",
                    !s?.valid && "opacity-60"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {s?.device ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s?.ip ?? "—"} · {s?.lastUsed ? new Date(s.lastUsed).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  {s?.valid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-[#FF3B30]"
                      onClick={() => handleRevokeOne(s?.id ?? "")}
                      disabled={revoke.isPending}
                      aria-label={`Revoke session ${s?.device ?? ""}`}
                    >
                      {revoke.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="h-4 w-4" aria-hidden />
                      )}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {(sessionList ?? []).length > 0 && (
            <div className="flex justify-end border-t border-white/[0.03] pt-3">
              <Button
                variant="outline"
                className="border-[#FF3B30]/50 text-[#FF3B30] hover:bg-[#FF3B30]/10"
                onClick={handleRevokeAll}
                disabled={revoke.isPending}
              >
                {revoke.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Revoke all sessions
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
