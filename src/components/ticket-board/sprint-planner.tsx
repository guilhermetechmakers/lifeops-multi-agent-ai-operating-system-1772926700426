/**
 * SprintPlanner — visualize sprints, capacity, drag tickets into sprint columns.
 */

import { useCallback } from "react";
import { Calendar, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Sprint, Ticket } from "@/types/projects";
import { useTicketBoardSprints } from "@/hooks/use-ticket-board";

export interface SprintPlannerProps {
  projectId: string;
  tickets: Ticket[];
  activeSprintId?: string | null;
  onSprintSelect?: (sprintId: string | null) => void;
  className?: string;
}

export function SprintPlanner({
  projectId,
  tickets,
  activeSprintId,
  onSprintSelect,
  className,
}: SprintPlannerProps) {
  const { items: sprints, isLoading } = useTicketBoardSprints(projectId);

  const sprintList = sprints ?? [];
  const ticketList = tickets ?? [];

  const getSprintStats = useCallback(
    (sprint: Sprint) => {
      const inSprint = ticketList.filter((t) => t.sprintId === sprint.id);
      const totalPoints = inSprint.reduce(
        (sum, t) => sum + (t.storyPoints ?? 0),
        0
      );
      const capacity = sprint.capacity ?? 0;
      const used = totalPoints;
      const pct = capacity > 0 ? Math.min(100, (used / capacity) * 100) : 0;
      const isOver = capacity > 0 && used > capacity;
      return { inSprint, totalPoints, capacity, used, pct, isOver };
    },
    [ticketList]
  );

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Sprint Planner
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sprintList.length === 0 ? (
          <div className="py-6 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No sprints defined</p>
          </div>
        ) : (
          <ScrollArea className="h-[240px]">
            <div className="space-y-3 pr-2">
              {sprintList.map((sprint) => {
                const stats = getSprintStats(sprint);
                const isActive = activeSprintId === sprint.id;
                const isLocked = sprint.state === "closed";

                return (
                  <button
                    key={sprint.id}
                    type="button"
                    onClick={() => onSprintSelect?.(isActive ? null : sprint.id)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-all",
                      "border-white/[0.03] bg-secondary/30 hover:bg-secondary/50",
                      isActive && "ring-2 ring-primary/40 bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {sprint.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize shrink-0"
                      >
                        {sprint.state ?? "planned"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      {sprint.startDate && sprint.endDate && (
                        <span>
                          {new Date(sprint.startDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}{" "}
                          –{" "}
                          {new Date(sprint.endDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      )}
                      {isLocked ? (
                        <Lock className="h-3 w-3 ml-1" />
                      ) : (
                        <Unlock className="h-3 w-3 ml-1" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>
                          {stats.totalPoints} pts / {stats.capacity} pts
                        </span>
                        {stats.isOver && (
                          <span className="text-destructive">Over capacity</span>
                        )}
                      </div>
                      <Progress
                        value={stats.pct}
                        className={cn(
                          "h-1.5",
                          stats.isOver && "[&>div]:bg-destructive"
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
