/**
 * ProjectHeader — project name, owners, status, integrations status.
 */

import { Link } from "react-router-dom";
import { ArrowLeft, FolderKanban, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/projects";

export interface ProjectHeaderProps {
  projectId: string;
  onStatusChange?: (status: ProjectStatus) => void;
  className?: string;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

export function ProjectHeader({ projectId, onStatusChange, className }: ProjectHeaderProps) {
  const { data: project, isLoading } = useProject(projectId);
  const owners = Array.isArray(project?.owners)
    ? project.owners
    : project?.owner
      ? [project.owner]
      : [];
  const integrations = project?.integrations ?? [];
  const status = (project?.status ?? "active") as ProjectStatus;

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        "rounded-lg border border-white/[0.03] bg-[#151718] p-4 md:p-5",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to projects">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">
              {project?.name ?? "Project"}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {owners.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {owners.slice(0, 3).map((o) => (
                    <Avatar key={o} className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-teal/20 text-teal">
                        {o.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {owners.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{owners.length - 3}</span>
                  )}
                </div>
              )}
              {integrations.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Plug className="h-3 w-3" />
                  {integrations.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Select
          value={status}
          onValueChange={(v) => onStatusChange?.(v as ProjectStatus)}
          disabled={!onStatusChange}
        >
          <SelectTrigger className="w-[120px] h-9 border-white/[0.03]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge
          variant={status === "active" ? "default" : status === "paused" ? "secondary" : "outline"}
          className="capitalize"
        >
          {status}
        </Badge>
        <Link to={`/dashboard/projects/${projectId}/ci-integrations`}>
          <Button variant="outline" size="sm" className="gap-1.5 border-white/[0.03]">
            <Plug className="h-4 w-4" />
            Connect integrations
          </Button>
        </Link>
      </div>
    </header>
  );
}
