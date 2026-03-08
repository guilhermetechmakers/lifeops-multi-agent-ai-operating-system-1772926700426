/**
 * Project Detail — single project cockpit with backlog, roadmap, tickets, PRs, agent history.
 */

import { useParams } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
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
} from "@/components/project-detail";
import {
  CIReleasePanel,
  AgentSuggestionsPanel,
  ApprovalsQueue,
  CronjobOverview,
  AuditTrailPanel,
} from "@/components/projects-dashboard";
import { useProjectCronjobs } from "@/hooks/use-projects";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <AnimatedPage>
        <div className="text-center py-12 text-muted-foreground">Project not found</div>
      </AnimatedPage>
    );
  }

  const { items: cronjobs } = useProjectCronjobs(projectId);
  const cronjobList = Array.isArray(cronjobs) ? cronjobs : [];
  const firstCronjobId = cronjobList[0]?.id;

  return (
    <AnimatedPage className="space-y-6">
      <ProjectHeader projectId={projectId} />

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Quick actions</h2>
          <ActionsWidgetBar projectId={projectId} cronjobId={firstCronjobId} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <BacklogPanel projectId={projectId} />
          <RoadmapPanel projectId={projectId} />
          <div className="grid gap-6 sm:grid-cols-2">
            <TicketsPanel projectId={projectId} />
            <PRsPanel projectId={projectId} />
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
    </AnimatedPage>
  );
}
