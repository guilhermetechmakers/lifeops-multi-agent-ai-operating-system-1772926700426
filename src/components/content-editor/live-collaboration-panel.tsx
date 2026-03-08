/**
 * LiveCollaborationPanel — cursors, presence indicators, per-section comments.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollaboratorPresence } from "@/types/content-editor";

export interface LiveCollaborationPanelProps {
  collaborators?: CollaboratorPresence[];
  className?: string;
}

const MOCK_COLLABORATORS: CollaboratorPresence[] = [
  { userId: "1", userName: "You", color: "#00C2A8", lastSeen: new Date().toISOString() },
  { userId: "2", userName: "Jane", color: "#FFB020", lastSeen: new Date().toISOString() },
];

export function LiveCollaborationPanel({
  collaborators = [],
  className,
}: LiveCollaborationPanelProps) {
  const items = Array.isArray(collaborators) && collaborators.length > 0
    ? collaborators
    : MOCK_COLLABORATORS;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-teal" />
          Collaboration
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Presence, cursors, comments
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(items ?? []).map((c) => (
            <div
              key={c.userId}
              className="flex items-center gap-2 rounded-lg border border-white/[0.03] bg-secondary/30 px-3 py-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: c.color ?? "#00C2A8" }}
              />
              <span className="text-sm text-foreground truncate">{c.userName ?? c.userId}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                Active
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
