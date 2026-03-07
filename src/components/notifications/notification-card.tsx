import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  Clock,
  ExternalLink,
  MoreHorizontal,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Notification, NotificationSeverity } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";

const severityConfig: Record<
  NotificationSeverity,
  { icon: typeof Bell; color: string; bg: string }
> = {
  info: { icon: Info, color: "text-muted-foreground", bg: "bg-muted/50" },
  warning: { icon: AlertTriangle, color: "text-amber", bg: "bg-amber/10" },
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  success: { icon: CheckCircle2, color: "text-teal", bg: "bg-teal/10" },
};

interface NotificationCardProps {
  notification: Notification;
  onAcknowledge?: (id: string) => void;
  onSnooze?: (id: string, durationMinutes: number) => void;
  isRead?: boolean;
  className?: string;
}

export function NotificationCard({
  notification,
  onAcknowledge,
  onSnooze,
  isRead = false,
  className,
}: NotificationCardProps) {
  const severity = notification.payload?.severity ?? "info";
  const config = severityConfig[severity] ?? severityConfig.info;
  const Icon = config.icon;
  const title = notification.payload?.title ?? "Notification";
  const body = notification.payload?.body;
  const agent = notification.payload?.agent;
  const actionUrl = notification.payload?.action_url;
  const createdAt = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : "";

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        !isRead && "border-l-2 border-l-primary",
        className
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              config.bg,
              config.color
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("font-medium text-foreground", isRead && "text-muted-foreground")}>
              {title}
            </p>
            {body && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{body}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {agent && <span>{agent}</span>}
              {createdAt && <span>· {createdAt}</span>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isRead && onAcknowledge && (
                <DropdownMenuItem onClick={() => onAcknowledge(notification.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Acknowledge
                </DropdownMenuItem>
              )}
              {onSnooze && (
                <>
                  <DropdownMenuItem onClick={() => onSnooze(notification.id, 60)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Snooze 1 hour
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSnooze(notification.id, 480)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Snooze 8 hours
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSnooze(notification.id, 1440)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Snooze 24 hours
                  </DropdownMenuItem>
                </>
              )}
              {actionUrl && (
                <DropdownMenuItem asChild>
                  <Link to={actionUrl}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          {!isRead && onAcknowledge && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(notification.id)}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="mr-1 h-4 w-4" />
              Acknowledge
            </Button>
          )}
          {actionUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link to={actionUrl} className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
                View
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
