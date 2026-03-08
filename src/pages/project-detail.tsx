/**
 * Project Detail — single project cockpit with backlog, roadmap, tickets, PRs, agent history.
 */

import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { Button } from "@/components/ui/button";
import {
  ProjectHeader,
  BacklogPanel,
  RoadmapPanel,
  TicketsPanel,
  PRsPanel,
  AgentHistoryPanel,
  ActionsWidgetBar,
  CronjobsDashboardLink,
  DataVizTinyCharts,
  ReleaseNotesGenerator,
} from "@/components/project-detail";
import {
  CIReleasePanel,
  AgentSuggestionsPanel,
  ApprovalsQueue,
  CronjobOverview,
  AuditTrailPanel,
} from "@/components/projects-dashboard";
import {
  useProjectCronjobs,
  useProject,
  useUpdateProjectStatus,
  useRunAgent,
  useProjectPRs,
  useProjectReleases,
} from "@/hooks/use-projects";
import type { ProjectStatus } from "@/types/projects";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project } = useProject(projectId ?? null);
  const updateStatus = useUpdateProjectStatus(projectId ?? "");
  const runAgent = useRunAgent(projectId ?? "");

  const handleStatusChange = useCallback(
    (status: ProjectStatus) => {
      if (projectId) updateStatus.mutate(status);
    },
    [projectId, updateStatus]
  );

  const handleSummarizePR = useCallback(
    (_prId: string) => {
      runAgent.mutate("summarizePR");
    },
    [runAgent]
  );

  if (!projectId) {
    return (
      <AnimatedPage>
        <div className="text-center py-12 text-muted-foreground">Project not found</div>
      </AnimatedPage>
    );
  }

  const { items: cronjobs } = useProjectCronjobs(projectId);
  const { items: prs } = useProjectPRs(projectId);
  const { items: releases } = useProjectReleases(projectId);
  const cronjobList = Array.isArray(cronjobs) ? cronjobs : [];
  const firstCronjobId = cronjobList[0]?.id;
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);

  return (
    <AnimatedPage className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <Link to={`/dashboard/projects/${projectId}`} className="hover:text-foreground transition-colors truncate max-w-[180px] md:max-w-none">
          {project?.name ?? "Project"}
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <span className="text-foreground font-medium">Detail</span>
      </nav>

      <ProjectHeader projectId={projectId} onStatusChange={handleStatusChange} />

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Quick actions</h2>
          <div className="flex gap-2 flex-wrap">
            <Link to={`/dashboard/projects/${projectId}/ticket-board`}>
              <Button variant="outline" size="sm">
                Open Ticket Board
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReleaseNotesOpen(true)}
            >
              Release Notes
            </Button>
            <ActionsWidgetBar projectId={projectId} cronjobId={firstCronjobId} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <BacklogPanel projectId={projectId} />
          <RoadmapPanel projectId={projectId} />
          <div className="grid gap-6 sm:grid-cols-2">
            <TicketsPanel projectId={projectId} />
            <PRsPanel projectId={projectId} onSummarize={handleSummarizePR} />
          </div>
        </div>
        <div className="space-y-6">
          <AgentHistoryPanel projectId={projectId} />
          <CronjobsDashboardLink projectId={projectId} />
          <CronjobOverview projectId={projectId} />
          <DataVizTinyCharts projectId={projectId} />
          <CIReleasePanel projectId={projectId} />
          <AgentSuggestionsPanel projectId={projectId} />
          <ApprovalsQueue projectId={projectId} />
          <AuditTrailPanel projectId={projectId} />
        </div>
      </div>

      <ReleaseNotesGenerator
        open={releaseNotesOpen}
        onOpenChange={setReleaseNotesOpen}
        projectId={projectId}
        releases={releases ?? []}
        prs={prs ?? []}
      />
    </AnimatedPage>
  );
}
