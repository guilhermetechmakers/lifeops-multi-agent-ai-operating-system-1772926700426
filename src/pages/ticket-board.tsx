/**
 * Ticket Board — Kanban board with automation rules, sprint planner, bulk actions.
 */

import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { TicketBoardLayout } from "@/components/ticket-board";
import { useProject } from "@/hooks/use-projects";

export default function TicketBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project } = useProject(projectId);

  if (!projectId) {
    return (
      <AnimatedPage>
        <div className="text-center py-12 text-muted-foreground">
          Project not found
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          to="/dashboard/projects"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Link
          to={`/dashboard/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {project?.name ?? "Project"}
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground font-medium">Ticket Board</span>
      </nav>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Ticket Board</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage tickets, sprints, and automation rules
        </p>
      </div>

      <TicketBoardLayout projectId={projectId} />
    </AnimatedPage>
  );
}
