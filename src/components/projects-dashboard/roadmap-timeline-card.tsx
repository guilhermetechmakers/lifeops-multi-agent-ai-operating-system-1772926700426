/**
 * RoadmapTimelineCard — interactive timeline with milestones, epics, dependencies.
 */

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectRoadmaps } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/types/projects";

export interface RoadmapTimelineCardProps {
  projectId: string;
  className?: string;
}

export function RoadmapTimelineCard({ projectId, className }: RoadmapTimelineCardProps) {
  const { items: roadmaps, isLoading } = useProjectRoadmaps(projectId);
  const roadmapList = Array.isArray(roadmaps) ? roadmaps : [];
  const roadmap = roadmapList[0];
  const milestones = Array.isArray(roadmap?.milestones) ? (roadmap.milestones as Milestone[]) : [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Roadmap
        </CardTitle>
        {roadmap && (
          <Badge variant="secondary" className="text-xs">
            {roadmap.status}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No milestones yet
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/[0.06]" aria-hidden />
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div
                  key={m.id}
                  className="relative flex items-start gap-4 pl-8 animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-secondary border-2 border-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {m.dueDate && (
                        <span className="text-xs text-muted-foreground">{m.dueDate}</span>
                      )}
                      <Badge
                        variant={m.status === "done" ? "success" : m.status === "in_progress" ? "default" : "secondary"}
                        className="text-[10px]"
                        aria-label={`Milestone status: ${m.status}`}
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
