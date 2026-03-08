/**
 * ProjectsOverview — global view when no project selected.
 * Aggregated KPIs, global search, cross-project links, agent-suggested actions.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Zap,
  Search,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjectsList, useProjectApprovals } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

export interface ProjectsOverviewProps {
  onProjectSelect?: (projectId: string) => void;
  className?: string;
}

export function ProjectsOverview({ onProjectSelect, className }: ProjectsOverviewProps) {
  const [search, setSearch] = useState("");
  const { items: projects } = useProjectsList();
  const { items: approvals } = useProjectApprovals(null);

  const projectList = Array.isArray(projects) ? projects : [];
  const approvalList = Array.isArray(approvals) ? approvals : [];
  const pendingApprovals = approvalList.filter((a) => a.status === "pending");

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projectList;
    const q = search.toLowerCase();
    return projectList.filter(
      (p: { name?: string; description?: string }) =>
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [projectList, search]);

  return (
    <div className={cn("space-y-6", className)}>
      <header>
        <h1 className="text-xl font-semibold text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Developer hub — roadmaps, tickets, PRs, CI status, and agent suggestions
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-white/[0.03]"
          aria-label="Search projects"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/[0.03] bg-card transition-all hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{projectList.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active projects</p>
          </CardContent>
        </Card>
        <Link to="/dashboard/approvals">
          <Card className="border-white/[0.03] bg-card transition-all hover:shadow-card-hover h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                Approvals Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{pendingApprovals.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending review</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="border-white/[0.03] bg-card transition-all hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber" />
              Agent Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Run triage, PR summaries, and release notes from project dashboards
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">All Projects</h2>
        {filteredProjects.length === 0 ? (
          <div className="rounded-lg border border-white/[0.03] bg-card p-8 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-2" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {search ? "No projects match your search" : "No projects yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredProjects.map((p: { id: string; name: string; description?: string }) => (
              <Link
                key={p.id}
                to={`/dashboard/projects/${p.id}`}
                onClick={() => onProjectSelect?.(p.id)}
                className="flex items-center gap-3 rounded-lg border border-white/[0.03] bg-card p-4 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
                  <FolderKanban className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{p.name}</p>
                  {p.description && (
                    <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
