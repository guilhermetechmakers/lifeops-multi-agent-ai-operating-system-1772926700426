/**
 * PublishingQueuePanel — list of scheduled posts with status, nextRun, channels, retries.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublishingQueue, useRetryPublish } from "@/hooks/use-content-dashboard";
import { format, parseISO } from "date-fns";

export interface PublishingQueuePanelProps {
  className?: string;
}

export function PublishingQueuePanel({ className }: PublishingQueuePanelProps) {
  const { data: queueItems, isLoading } = usePublishingQueue();
  const retryPublish = useRetryPublish();
  const items = queueItems ?? [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Publishing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "published":
        return "text-teal";
      case "failed":
        return "text-destructive";
      case "publishing":
        return "text-amber";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Send className="h-5 w-5 text-purple" />
          Publishing Queue
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Status, next run, channels, retries
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <Send className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No items in queue</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(items ?? []).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className={cn("capitalize", statusColor(item.status))}>
                        {item.status}
                      </span>
                      {item.nextRun && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(item.nextRun), "MMM d, HH:mm")}
                        </span>
                      )}
                      {item.retries != null && item.retries > 0 && (
                        <span>Retries: {item.retries}</span>
                      )}
                    </div>
                    {(item.channels ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(item.channels ?? []).map((ch) => (
                          <span
                            key={ch}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.status === "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-7"
                      onClick={() => retryPublish.mutate(item.id)}
                      disabled={retryPublish.isPending}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
