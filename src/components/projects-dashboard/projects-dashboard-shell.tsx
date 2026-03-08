/**
 * Projects Dashboard Shell — layout with left project rail, header, content grid.
 */

import { Link, useParams } from "react-router-dom";
import { FolderKanban, GitBranch, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectsList } from "@/hooks/use-projects";
import { RoadmapTimelineCard } from "./roadmap-timeline-card";
import { TicketKanbanBoard } from "./ticket-kanban-board";
import { PRSummariesPanel } from "./pr-summaries-panel";
import { CIReleasePanel } from "./ci-release-panel";
import { AgentSuggestionsPanel } from "./agent-suggestions-panel";
import { ApprovalsQueue } from "./approvals-queue";
import { CronjobOverview } from "./cronjob-overview";
import { ProjectDetailLinkCard } from "./project-detail-link-card";
import { DataVizPanel } from "./data-viz-panel";
import { AuditTrailPanel } from "./audit-trail-panel";
import { AnimatedPage } from "@/components/animated-page";

const SIDEBAR_WIDTH = 260;

export function ProjectsDashboardShell() {
  const { projectId } = useParams<{ projectId: string }>();
  const activeId = projectId ?? null;

  const { items: projects, isLoading } = useProjectsList();
  const projectList = projects ?? [];

  return (
    <AnimatedPage className="flex h-full gap-0 -m-4 md:-m-6">
      {/* Left project rail */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-white/[0.03] bg-[#151718] shrink-0 transition-[width] duration-200"
        )}
        style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}
      >
        <div className="flex h-14 items-center px-4 border-b border-white/[0.03]">
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
        </div>
        <ScrollArea className="flex-1 py-2">
          {isLoading ? (
            <div className="space-y-2 px-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : projectList.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <GitBranch className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-1">Connect a repository</p>
            </div>
          ) : (
            <nav className="grid gap-1 px-2">
              {projectList.map((p: { id: string; name: string }) => {
                const isActive = activeId === p.id;
                return (
                  <Link key={p.id} to={`/dashboard/projects/${p.id}`}>
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary border-l-2 border-primary -ml-0.5 pl-3.5"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <FolderKanban className="h-4 w-4 shrink-0" />
                      <span className="truncate">{p.name}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0 ml-auto transition-transform",
                          isActive && "text-primary"
                        )}
                      />
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {activeId ? (
          <div className="p-4 md:p-6 space-y-6">
            <ProjectDetailLinkCard projectId={activeId} />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <RoadmapTimelineCard projectId={activeId} />
                <TicketKanbanBoard projectId={activeId} />
                <PRSummariesPanel projectId={activeId} />
              </div>
              <div className="space-y-6">
                <CIReleasePanel projectId={activeId} />
                <AgentSuggestionsPanel projectId={activeId} />
                <ApprovalsQueue projectId={activeId} />
                <CronjobOverview projectId={activeId} />
                <DataVizPanel projectId={activeId} />
                <AuditTrailPanel projectId={activeId} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Select a project</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Choose a project from the left rail to view roadmaps, tickets, PRs, CI status, and agent suggestions.
            </p>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
