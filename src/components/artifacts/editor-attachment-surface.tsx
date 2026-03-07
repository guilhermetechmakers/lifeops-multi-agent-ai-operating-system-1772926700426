/**
 * Editor Attachment Surface — attach artifacts to content items.
 * Used within Content Editor (idea/research/draft/schedule/publish).
 * Shows artifact list per content item with version history.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadDrawer } from "@/components/artifacts/upload-drawer";
import { ArtifactViewer } from "@/components/artifacts/artifact-viewer";
import {
  useArtifactList,
  useArtifactVersions,
} from "@/hooks/use-artifacts";
import { formatFileSize } from "@/lib/format";
import { Paperclip, FileIcon, ImageIcon, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Artifact } from "@/types/artifact";

export interface EditorAttachmentSurfaceProps {
  contentItemId: string;
  /** Attached artifact IDs (controlled by parent) */
  attachedIds?: string[];
  /** Callback when user selects an artifact to attach */
  onAttach?: (artifactId: string, versionNumber?: number) => void;
  /** Callback when user detaches */
  onDetach?: (artifactId: string) => void;
  /** Workflow step label for context */
  stepLabel?: string;
  className?: string;
}

function getFileIcon(type: string) {
  const t = (type ?? "").toLowerCase();
  if (t.startsWith("image/")) return ImageIcon;
  if (t.includes("text") || t.includes("json")) return FileText;
  return FileIcon;
}

export function EditorAttachmentSurface({
  contentItemId,
  attachedIds = [],
  onAttach,
  onDetach,
  stepLabel,
  className,
}: EditorAttachmentSurfaceProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerArtifact, setViewerArtifact] = useState<Artifact | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useArtifactList({
    contentItemId,
    pageSize: 50,
  });
  const artifacts = (data?.artifacts ?? []) as Artifact[];

  const { data: versionsData } = useArtifactVersions(expandedId);
  const versions = Array.isArray(versionsData) ? versionsData : [];

  const attached = artifacts.filter((a: Artifact) => attachedIds.includes(a.id));

  return (
    <div className={cn("space-y-3", className)}>
      {stepLabel && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {stepLabel}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUploadOpen(true)}
          className="border-white/[0.03]"
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Attach artifact
        </Button>
      </div>

      {attached.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Attached ({attached.length})</p>
          <ul className="space-y-1">
            {attached.map((a) => {
              const Icon = getFileIcon(a.type);
              const isExpanded = expandedId === a.id;
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 text-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-foreground hover:underline"
                    onClick={() => {
                      setViewerArtifact(a);
                      setViewerOpen(true);
                    }}
                  >
                    {a.name}
                  </button>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatFileSize(a.size)}
                  </span>
                  {onDetach && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDetach(a.id)}
                    >
                      Detach
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : a.id)
                    }
                    aria-label="Toggle versions"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </Button>
                </li>
              );
            })}
          </ul>
          {expandedId && versions.length > 0 && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/[0.06] pl-3">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span>v{v.versionNumber}</span>
                  <span>{new Date(v.uploadedAt).toLocaleDateString()}</span>
                  {onAttach && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => onAttach(expandedId, v.versionNumber)}
                    >
                      Use this version
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {artifacts.length > 0 && attached.length < artifacts.length && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Available to attach</p>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {artifacts
              .filter((a: Artifact) => !attachedIds.includes(a.id))
              .map((a: Artifact) => {
                const Icon = getFileIcon(a.type);
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-foreground hover:underline"
                      onClick={() => {
                        setViewerArtifact(a);
                        setViewerOpen(true);
                      }}
                    >
                      {a.name}
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => onAttach?.(a.id)}
                    >
                      Attach
                    </Button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {!isLoading && artifacts.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No artifacts for this content. Upload to attach.
        </p>
      )}

      <UploadDrawer
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        contentItemId={contentItemId}
        onUploadComplete={() => {}}
      />

      <ArtifactViewer
        artifact={viewerArtifact}
        open={viewerOpen}
        onOpenChange={(open) => {
          setViewerOpen(open);
          if (!open) setViewerArtifact(null);
        }}
      />
    </div>
  );
}
