/**
 * NotificationsTray — Inline alert surface for imminent charges,
 * limit advisories, and churn risk notices.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CreditCard, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItemBilling } from "@/types/finance";

export interface NotificationItem {
  id: string;
  type: "imminent_charge" | "limit_advisory" | "churn_risk";
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionUrl?: string | null;
  severity?: "info" | "warning" | "error";
}

export interface NotificationsTrayProps {
  notifications?: NotificationItem[];
  /** Alias for notifications — accepts NotificationItemBilling[] */
  items?: NotificationItemBilling[];
  isLoading?: boolean;
  onDismiss?: (id: string) => void;
  onAction?: (item: NotificationItemBilling | NotificationItem) => void;
  className?: string;
}

function getIcon(type: NotificationItem["type"] | NotificationItemBilling["type"]) {
  switch (type) {
    case "imminent_charge":
      return CreditCard;
    case "limit_advisory":
      return AlertTriangle;
    case "churn_risk":
      return TrendingDown;
    default:
      return Bell;
  }
}

function getSeverityClass(severity?: string) {
  switch (severity) {
    case "error":
      return "border-destructive/30 bg-destructive/10";
    case "warning":
      return "border-amber/30 bg-amber/10";
    default:
      return "border-white/[0.03] bg-secondary/30";
  }
}

function getItemSeverity(n: NotificationItem | NotificationItemBilling): string | undefined {
  if ("severity" in n && n.severity) return n.severity;
  if (n.type === "churn_risk" || n.type === "limit_advisory") return "warning";
  return "info";
}

export function NotificationsTray({
  notifications = [],
  items: itemsProp,
  isLoading,
  onAction,
  className,
}: NotificationsTrayProps) {
  const fromItems = Array.isArray(itemsProp) ? itemsProp : [];
  const fromNotif = Array.isArray(notifications) ? notifications : [];
  const items = fromItems.length > 0 ? fromItems : fromNotif;

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-secondary"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  getSeverityClass(getItemSeverity(n))
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 mt-0.5",
                    getItemSeverity(n) === "error" && "text-destructive",
                    getItemSeverity(n) === "warning" && "text-amber"
                  )}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title ?? "—"}</p>
                  {n.message && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {n.message}
                    </p>
                  )}
                  {((n as NotificationItem).actionLabel ||
                    (n as NotificationItemBilling).actionUrl) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs mt-2"
                      onClick={() => {
                        (n as NotificationItem).onAction?.();
                        onAction?.(n as NotificationItemBilling);
                      }}
                    >
                      {(n as NotificationItem).actionLabel ?? "View"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
