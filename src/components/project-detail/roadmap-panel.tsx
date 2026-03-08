/**
 * RoadmapPanel — roadmap items with progress, owner, due date.
 */

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectRoadmapItems } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { RoadmapItem } from "@/types/projects";

export interface RoadmapPanelProps {
  projectId: string;
  className?: string;
}

export function RoadmapPanel({ projectId, className }: RoadmapPanelProps) {
  const { items: roadmapItems, isLoading } = useProjectRoadmapItems(projectId);
  const list = roadmapItems ?? [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-8 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No roadmap items yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((item, i) => (
              <RoadmapItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoadmapItemCard({ item, index }: { item: RoadmapItem; index: number }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-secondary/30 p-3",
        "hover:bg-secondary/50 transition-colors animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        <Badge
          variant={
            item.status === "Completed"
              ? "success"
              : item.status === "In Progress"
                ? "default"
                : "secondary"
          }
          className="text-[10px] shrink-0"
        >
          {item.status}
        </Badge>
      </div>
      <div className="mt-2">
        <Progress value={item.progress} className="h-1.5" />
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        {item.ownerName && <span>{item.ownerName}</span>}
        {item.dueDate && (
          <>
            {item.ownerName && <span>•</span>}
            <span>Due {item.dueDate}</span>
          </>
        )}
      </div>
    </div>
  );
}
