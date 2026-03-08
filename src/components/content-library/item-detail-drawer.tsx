/**
 * ItemDetailDrawer — side panel with extended metadata, history, quick actions (pipeline, artifacts, edit).
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PipelineConnectorPanel } from "./pipeline-connector-panel";
import { ExternalLink, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content-library";

export interface ItemDetailDrawerProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineState?: { state: string; next?: string; runs: Array<{ runId: string; startedAt: string; status: string }> } | null | undefined;
  onOpenInPipeline?: (id: string) => void;
  onViewArtifacts?: (id: string) => void;
  onEdit?: (id: string) => void;
}

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function ItemDetailDrawer({
  item,
  open,
  onOpenChange,
  pipelineState,
  onOpenInPipeline,
  onViewArtifacts,
  onEdit,
}: ItemDetailDrawerProps) {
  if (!item) return null;

  const title = item?.title ?? "Untitled";
  const author = item?.author ?? "—";
  const status = item?.status ?? "draft";
  const tags = (item?.tags ?? []);
  const channel = item?.channel ?? "—";
  const owner = item?.owner ?? "—";
  const summary = item?.summary ?? "";
  const runs = (pipelineState?.runs ?? []).slice(0, 5);
  const versionHistory = (item?.versionHistory ?? []).slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={true}
        className={cn(
          "fixed left-auto right-0 top-0 h-full max-h-none w-full max-w-md translate-y-0 rounded-l-xl rounded-r-none border-l border-white/[0.03] p-0 transition-transform duration-200",
          "translate-x-full data-[state=open]:translate-x-0"
        )}
      >
        <DialogHeader className="border-b border-white/[0.03] px-6 py-4">
          <DialogTitle className="text-lg font-semibold pr-8">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-8rem)]">
          <div className="space-y-6 px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {status}
              </Badge>
              {(tags ?? []).map((t) => (
                <span
                  key={t}
                  className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Author</dt>
                <dd>{author}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Channel</dt>
                <dd>{channel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Owner</dt>
                <dd>{owner}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Publish date</dt>
                <dd>{formatDate(item?.publishDate ?? item?.createdAt)}</dd>
              </div>
            </dl>
            {summary && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                <p className="text-sm">{summary}</p>
              </div>
            )}
            {(item?.metrics?.views != null || item?.metrics?.engagements != null) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Metrics</h4>
                <p className="text-sm">
                  Views: {item?.metrics?.views ?? 0} · Engagements: {item?.metrics?.engagements ?? 0}
                </p>
              </div>
            )}
            {(item?.seoScore != null || item?.version != null) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">SEO & Version</h4>
                <p className="text-sm">
                  {item?.seoScore != null && `SEO Score: ${item.seoScore}`}
                  {item?.seoScore != null && item?.version != null && " · "}
                  {item?.version != null && `Version ${item.version}`}
                </p>
              </div>
            )}
            {versionHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  Version history
                </h4>
                <ul className="space-y-1 text-sm">
                  {versionHistory.map((v) => (
                    <li key={v.id} className="flex justify-between text-muted-foreground">
                      <span>v{v.versionNumber}</span>
                      <span>{formatDate(v.changedAt)} · {v.changedBy ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <PipelineConnectorPanel
              itemId={item.id}
              pipelineState={pipelineState?.state}
              nextStep={pipelineState?.next}
              runs={runs}
              onOpenInPipeline={() => onOpenInPipeline?.(item.id)}
              onViewArtifacts={() => onViewArtifacts?.(item.id)}
            />
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.03]">
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={() => onOpenInPipeline?.(item.id)}
              >
                <ExternalLink className="h-4 w-4" />
                Open in pipeline
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onViewArtifacts?.(item.id)}
              >
                <FileText className="h-4 w-4" />
                View artifacts
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(item.id)}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
