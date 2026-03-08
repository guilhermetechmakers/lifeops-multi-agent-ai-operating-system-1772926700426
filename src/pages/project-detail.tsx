/**
 * Project Detail — single project view with backlog, roadmap, tickets, PRs, agent-run history.
 */

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import {
  RoadmapTimelineCard,
  TicketKanbanBoard,
  PRSummariesPanel,
  CIReleasePanel,
  AgentSuggestionsPanel,
  ApprovalsQueue,
  AuditTrailPanel,
} from "@/components/projects-dashboard";
import { useProject } from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <AnimatedPage>
        <div className="text-center py-12 text-muted-foreground">Project not found</div>
      </AnimatedPage>
    );
  }

  const { data: project, isLoading } = useProject(projectId);

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <header className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">{project?.name ?? "Project"}</h1>
          </header>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RoadmapTimelineCard projectId={projectId} />
          <TicketKanbanBoard projectId={projectId} />
          <PRSummariesPanel projectId={projectId} />
        </div>
        <div className="space-y-6">
          <CIReleasePanel projectId={projectId} />
          <AgentSuggestionsPanel projectId={projectId} />
          <ApprovalsQueue projectId={projectId} />
          <AuditTrailPanel projectId={projectId} />
        </div>
      </div>
    </AnimatedPage>
  );
}
