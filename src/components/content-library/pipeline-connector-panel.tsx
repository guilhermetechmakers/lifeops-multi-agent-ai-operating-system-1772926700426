/**
 * PipelineConnectorPanel — links to Content Pipeline Automation for a given asset; shows state and runs.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Workflow } from "lucide-react";

export interface PipelineConnectorPanelProps {
  itemId: string;
  pipelineState?: string;
  nextStep?: string;
  runs?: Array<{ runId: string; startedAt: string; status: string }>;
  onOpenInPipeline?: () => void;
  onViewArtifacts?: () => void;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function PipelineConnectorPanel({
  itemId,
  pipelineState = "draft",
  nextStep,
  runs = [],
  onOpenInPipeline,
  onViewArtifacts,
}: PipelineConnectorPanelProps) {
  const runList = Array.isArray(runs) ? runs : [];

  return (
    <div
      className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4 space-y-3"
      role="region"
      aria-label="Content pipeline"
    >
      <div className="flex items-center gap-2">
        <Workflow className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h4 className="text-sm font-medium">Pipeline</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        State: <span className="capitalize text-foreground">{pipelineState}</span>
        {nextStep && (
          <> · Next: <span className="capitalize text-foreground">{nextStep}</span></>
        )}
      </p>
      {runList.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {runList.map((r) => (
            <li key={r.runId}>
              {formatDate(r.startedAt)} — {r.status}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Link to={`/dashboard/content/editor?itemId=${itemId}`}>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onOpenInPipeline}>
            Open in pipeline
          </Button>
        </Link>
        {onViewArtifacts && (
          <Button variant="ghost" size="sm" onClick={onViewArtifacts}>
            View artifacts
          </Button>
        )}
      </div>
    </div>
  );
}
