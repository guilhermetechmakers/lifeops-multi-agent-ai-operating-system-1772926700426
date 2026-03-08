/**
 * ActivityAuditTrail — read-only log of changes to integrations.
 */

import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { IntegrationAuditEntry } from "@/types/integrations";

export interface ActivityAuditTrailProps {
  entries: IntegrationAuditEntry[];
  className?: string;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function ActivityAuditTrail({ entries = [], className }: ActivityAuditTrailProps) {
  const list = Array.isArray(entries) ? entries : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Activity audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No audit entries yet.
          </p>
        ) : (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {(list as IntegrationAuditEntry[]).map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-0.5 rounded-md border border-white/[0.03] bg-secondary/20 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  {entry.actorName && (
                    <span className="text-xs text-muted-foreground">
                      by {entry.actorName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
