/**
 * ActionsWidgetBar — quick action buttons for agent runs and workflows.
 */

import { Bot, FileText, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRunAgent, useTriggerCronjob } from "@/hooks/use-projects";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface ActionsWidgetBarProps {
  projectId: string;
  cronjobId?: string;
  className?: string;
}

export function ActionsWidgetBar({ projectId, cronjobId, className }: ActionsWidgetBarProps) {
  const runAgent = useRunAgent(projectId);
  const triggerCronjob = useTriggerCronjob(projectId);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        size="sm"
        className="gap-1.5"
        onClick={() => runAgent.mutate("triage")}
        disabled={runAgent.isPending}
      >
        <Bot className="h-4 w-4" />
        Run Agent Triage
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={() => runAgent.mutate("generateReleaseNotes")}
        disabled={runAgent.isPending}
      >
        <FileText className="h-4 w-4" />
        Generate Release Notes
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={() => runAgent.mutate("ciTrigger")}
        disabled={runAgent.isPending}
      >
        <Play className="h-4 w-4" />
        Trigger CI/CD
      </Button>
      <Link to="/dashboard/cronjobs/new">
        <Button size="sm" variant="outline" className="gap-1.5">
          <Clock className="h-4 w-4" />
          Schedule Cronjob
        </Button>
      </Link>
      {cronjobId && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => triggerCronjob.mutate(cronjobId)}
          disabled={triggerCronjob.isPending}
        >
          <Play className="h-4 w-4" />
          Run Cronjob
        </Button>
      )}
    </div>
  );
}
