import { useState, useMemo } from "react";
import { Bell, Search, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { NotificationCard } from "./notification-card";
import { useNotificationsList, useMarkNotificationRead, useSnoozeNotification } from "@/hooks/use-notifications";

type FilterStatus = "all" | "unread" | "read";
type FilterChannel = "all" | "in_app" | "email" | "push";

interface NotificationCenterProps {
  maxHeight?: string;
  className?: string;
}

export function NotificationCenter({ maxHeight = "400px", className }: NotificationCenterProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [channelFilter, setChannelFilter] = useState<FilterChannel>("all");

  const { items, isLoading, isError } = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const snooze = useSnoozeNotification();

  const filteredItems = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.filter((n) => {
      const title = n.payload?.title ?? "";
      const body = n.payload?.body ?? "";
      const agent = n.payload?.agent ?? "";
      const matchesSearch =
        !search ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        body.toLowerCase().includes(search.toLowerCase()) ||
        agent.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && n.status !== "read") ||
        (statusFilter === "read" && n.status === "read");
      const matchesChannel = channelFilter === "all" || n.channel === channelFilter;
      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [items, search, statusFilter, channelFilter]);

  const unreadCount = useMemo(
    () => (Array.isArray(items) ? items.filter((n) => n.status !== "read").length : 0),
    [items]
  );

  const handleAcknowledge = (id: string) => {
    markRead.mutate(id);
  };

  const handleSnooze = (id: string, durationMinutes: number) => {
    snooze.mutate({ notificationId: id, durationMinutes });
  };

  if (isError) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Failed to load notifications
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-heading-md font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input"
            aria-label="Search notifications"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter("all"); setChannelFilter("all"); }}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter("unread"); setChannelFilter("all"); }}
          >
            Unread
          </Button>
          <Button
            variant={statusFilter === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter("read"); setChannelFilter("all"); }}
          >
            Read
          </Button>
          <Button
            variant={channelFilter === "in_app" ? "default" : "outline"}
            size="sm"
            onClick={() => setChannelFilter("in_app")}
          >
            In-app
          </Button>
        </div>
        <div
          className="space-y-3 overflow-y-auto rounded-lg border border-white/[0.03] p-2"
          style={{ maxHeight }}
        >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              filteredItems.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onAcknowledge={handleAcknowledge}
                  onSnooze={handleSnooze}
                  isRead={n.status === "read"}
                />
              ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}
