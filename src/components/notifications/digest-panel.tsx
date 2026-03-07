import { useState } from "react";
import { ChevronDown, ChevronRight, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import { NotificationCard } from "./notification-card";
import { format } from "date-fns";

interface DigestGroup {
  windowStart: string;
  windowEnd: string;
  notifications: Notification[];
}

interface DigestPanelProps {
  groups: DigestGroup[];
  onAcknowledge?: (id: string) => void;
  onSnooze?: (id: string, durationMinutes: number) => void;
  className?: string;
}

export function DigestPanel({
  groups,
  onAcknowledge,
  onSnooze,
  className,
}: DigestPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const safeGroups = Array.isArray(groups) ? groups : [];

  if (safeGroups.length === 0) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No digest groups</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {safeGroups.map((group) => {
        const key = `${group.windowStart}-${group.windowEnd}`;
        const isExpanded = expanded[key] ?? true;
        const items = Array.isArray(group.notifications) ? group.notifications : [];

        return (
          <Card key={key} className="border-white/[0.03] bg-card">
            <CardHeader
              className="cursor-pointer py-4 md:py-5"
              onClick={() => setExpanded((s) => ({ ...s, [key]: !isExpanded }))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">
                    {format(new Date(group.windowStart), "MMM d, yyyy")} —{" "}
                    {format(new Date(group.windowEnd), "MMM d, yyyy")}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {items.length} notification{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="space-y-3 pt-0">
                {items.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onAcknowledge={onAcknowledge}
                    onSnooze={onSnooze}
                    isRead={n.status === "read"}
                  />
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
