/**
 * SessionListPanel — Per-user session viewer with revoke actions.
 * Device, IP, last used; Revoke All or individual session revoke.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserSessions, useRevokeUserSessions } from "@/hooks/use-admin";
import type { AdminUser, AdminSession } from "@/types/admin";
import { Monitor, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SessionListPanelProps {
  user: AdminUser | null;
  onClose: () => void;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

export function SessionListPanel({ user, onClose }: SessionListPanelProps) {
  const { sessions, isLoading } = useUserSessions(user?.id ?? null);
  const revoke = useRevokeUserSessions();

  const sessionList = (sessions ?? []) as AdminSession[];
  const validSessions = sessionList.filter((s) => s?.valid !== false);

  const handleRevokeAll = () => {
    if (!user?.id) return;
    revoke.mutate({ userId: user.id }, { onSuccess: () => onClose() });
  };

  const handleRevokeOne = (sessionId: string) => {
    if (!user?.id) return;
    revoke.mutate({ userId: user.id, sessionId });
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" aria-describedby="session-panel-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sessions
          </DialogTitle>
          <p id="session-panel-desc" className="text-sm text-muted-foreground">
            {user?.name ?? "—"} · {user?.email ?? "—"}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-secondary/50" />
              ))}
            </div>
          ) : sessionList.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No active sessions</p>
          ) : (
            <ul className="space-y-2" role="list">
              {sessionList.map((s) => (
                <li
                  key={s?.id ?? ""}
                  className={cn(
                    "flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-3 transition-colors duration-200 hover:bg-secondary/50",
                    !s?.valid && "opacity-60"
                  )}
                >
                  <div>
                    <p className="font-medium">{s?.device ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      IP: {s?.ip ?? "—"} · Last used: {formatDate(s?.lastUsed)}
                    </p>
                  </div>
                  {s?.valid !== false && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevokeOne(s?.id ?? "")}
                      aria-label={`Revoke session ${s?.device ?? ""}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {validSessions.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleRevokeAll}
              disabled={revoke.isPending}
            >
              {revoke.isPending ? "Revoking…" : "Revoke all sessions"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
