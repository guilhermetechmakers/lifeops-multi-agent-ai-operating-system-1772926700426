/**
 * ArtifactsPanel — list of run artifacts with download, filter by type, checksum, copy link.
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/format";
import type { RunArtifact } from "@/types/run-details";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function ArtifactRow({ artifact }: { artifact: RunArtifact }) {
  const [copied, setCopied] = useState(false);
  const link = artifact.url ?? "#";

  const copyLink = () => {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/[0.06] bg-secondary/20 p-3 transition-colors hover:bg-secondary/40">
      <div className="flex min-w-0 items-center gap-3">
        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{artifact.name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{artifact.type}</span>
            {artifact.size != null && <span>{formatFileSize(artifact.size)}</span>}
            <span>Produced: {formatTime(artifact.producedAt)}</span>
            {artifact.provenance?.agent != null && (
              <span>Agent: {artifact.provenance.agent}</span>
            )}
          </div>
          {artifact.checksum != null && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {artifact.checksum}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          onClick={copyLink}
          aria-label="Copy download link"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy link
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          asChild
          aria-label={`Download ${artifact.name}`}
        >
          <a href={link} download={artifact.name} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
}

export interface ArtifactsPanelProps {
  artifacts: RunArtifact[];
  className?: string;
}

export function ArtifactsPanel({ artifacts, className }: ArtifactsPanelProps) {
  const rawList = Array.isArray(artifacts) ? artifacts : [];
  const [typeFilter, setTypeFilter] = useState<string>("");

  const list = useMemo(() => {
    if (!typeFilter) return rawList;
    return rawList.filter((a) => (a.type ?? "") === typeFilter);
  }, [rawList, typeFilter]);

  const types = useMemo(() => {
    return [...new Set(rawList.map((a) => a.type).filter(Boolean))].sort();
  }, [rawList]);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Artifacts</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generated outputs with provenance (run, agent, timestamp).
        </p>
        {types.length > 0 && (
          <div className="mt-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {list.length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No artifacts. Generated files and outputs will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((a) => (
              <li key={a.id}>
                <ArtifactRow artifact={a} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
