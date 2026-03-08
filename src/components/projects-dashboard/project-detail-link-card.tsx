/**
 * ProjectDetailLinkCard — summary stats and quick link to project detail.
 */

import { Link } from "react-router-dom";
import { ArrowRight, FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useProjectTickets, useProjectPRs } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

export interface ProjectDetailLinkCardProps {
  projectId: string;
  className?: string;
}

export function ProjectDetailLinkCard({ projectId, className }: ProjectDetailLinkCardProps) {
  const { data: project, isLoading } = useProject(projectId);
  const { items: tickets } = useProjectTickets(projectId);
  const { items: prs } = useProjectPRs(projectId);

  const ticketCount = (tickets ?? []).length;
  const prCount = (prs ?? []).length;
  const inProgress = (tickets ?? []).filter((t) => t.status === "in_progress").length;

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            {project?.name ?? "Project"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {project?.description ?? "Developer hub — roadmap, PRs, CI status"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/projects/${projectId}/ticket-board`}>
            <Button variant="default" size="sm" className="gap-1.5">
              Ticket Board
            </Button>
          </Link>
          <Link to={`/dashboard/projects/${projectId}/detail`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              View detail
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Tickets</span>
            <span className="ml-2 font-medium text-foreground">{ticketCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">In progress</span>
            <span className="ml-2 font-medium text-teal">{inProgress}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Open PRs</span>
            <span className="ml-2 font-medium text-foreground">{prCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
