/**
 * Run artifacts preview: logs, diffs, generated artifacts with download/export.
 */

import { FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunArtifact } from "@/types/approvals";

export interface RunArtifactsPreviewProps {
  artifacts: RunArtifact[] | null | undefined;
  className?: string;
}

export function RunArtifactsPreview({ artifacts, className }: RunArtifactsPreviewProps) {
  const list = Array.isArray(artifacts) ? artifacts : [];

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No artifacts</p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {list.map((art) => (
        <div
          key={art.id}
          className="rounded-lg border border-white/[0.03] bg-secondary/20 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {art.type}
            </span>
            {art.contentUrl && (
              <a
                href={art.contentUrl}
                download
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            )}
          </div>
          {art.inlineContent && (
            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 rounded p-2 border border-white/[0.03]">
              {art.inlineContent}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
