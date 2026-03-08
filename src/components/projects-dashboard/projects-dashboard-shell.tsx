/**
 * Projects Dashboard Shell — layout with left project rail, header, content grid.
 * Collapsible sidebar; mobile drawer for project list; breadcrumbs for context.
 */

import { Link, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { FolderKanban, GitBranch, ChevronRight, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjectsList } from "@/hooks/use-projects";
import { ProjectsOverview } from "./projects-overview";
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  const { items: projects, isLoading } = useProjectsList();
  const projectList = Array.isArray(projects) ? projects : [];
  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projectList;
    const q = projectSearch.toLowerCase();
    return projectList.filter(
      (p: { name: string; id?: string }) =>
        p.name?.toLowerCase().includes(q) || p.id?.toLowerCase().includes(q)
    );
  }, [projectList, projectSearch]);
  const activeProject = projectList.find((p: { id: string }) => p.id === activeId);

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
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="pl-8 h-9 text-sm border-white/[0.03] bg-secondary/30"
              aria-label="Search projects"
            />
          </div>
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
              {filteredProjects.map((p: { id: string; name: string }) => {
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
            {/* Breadcrumbs + mobile project picker */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
                <Link
                  to="/dashboard/projects"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Projects
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium truncate max-w-[180px] md:max-w-none">
                  {activeProject?.name ?? "Project"}
                </span>
              </nav>
              <div className="md:hidden">
                <Dialog open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Menu className="h-4 w-4" />
                      Change project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xs p-0 gap-0" showClose={true}>
                    <DialogHeader className="p-4 pb-2">
                      <DialogTitle>Select project</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] px-2 pb-4">
                      <nav className="grid gap-1">
                        {filteredProjects.map((p: { id: string; name: string }) => (
                          <Link
                            key={p.id}
                            to={`/dashboard/projects/${p.id}`}
                            onClick={() => setMobileSheetOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                              activeId === p.id
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                          >
                            <FolderKanban className="h-4 w-4 shrink-0" />
                            <span className="truncate">{p.name}</span>
                            <ChevronRight className="h-4 w-4 shrink-0 ml-auto" />
                          </Link>
                        ))}
                      </nav>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
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
          <div className="p-4 md:p-6">
            <ProjectsOverview />
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
