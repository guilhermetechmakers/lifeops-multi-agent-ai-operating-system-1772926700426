/**
 * Artifact Viewer — inline preview for images, text, code, PDFs.
 * Download via signed URL; LifeOps design system.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image, FileCode } from "lucide-react";
import { getDownloadUrl } from "@/api/artifacts";
import type { Artifact } from "@/types/artifact";

export interface ArtifactViewerProps {
  artifact: Artifact | null;
  versionNumber?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREVIEW_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  text: ["text/plain", "text/html", "text/css", "text/javascript", "application/json", "application/xml"],
};

function getPreviewCategory(type: string): "image" | "text" | "other" {
  const t = (type ?? "").toLowerCase();
  if (PREVIEW_TYPES.image.some((m) => t.includes(m.split("/")[0]))) return "image";
  if (PREVIEW_TYPES.text.some((m) => t.includes(m.split("/")[0]) || t === "text/plain")) return "text";
  return "other";
}

export function ArtifactViewer({
  artifact,
  versionNumber,
  open,
  onOpenChange,
}: ArtifactViewerProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !artifact) {
      setDownloadUrl(null);
      setPreviewUrl(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getDownloadUrl(artifact.id, versionNumber)
      .then((res) => {
        if (cancelled) return;
        const url = res?.url ?? null;
        setDownloadUrl(url);
        const cat = getPreviewCategory(artifact.type);
        if (cat === "image" && url) setPreviewUrl(url);
        else setPreviewUrl(null); // text/code/other: show download only
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, artifact?.id, artifact?.type, versionNumber]);

  if (!artifact) return null;

  const category = getPreviewCategory(artifact.type);
  const Icon =
    category === "image" ? Image : category === "text" ? FileCode : FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in" showClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {artifact.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0 rounded-lg border border-white/[0.03] bg-secondary/30">
          {loading && (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Loading…
            </div>
          )}
          {!loading && previewUrl && category === "image" && (
            <img
              src={previewUrl}
              alt={artifact.name}
              className="max-w-full h-auto object-contain"
            />
          )}
          {!loading && previewUrl && category === "text" && (
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Text/code file — download to view
              </p>
              <Button asChild size="sm">
                <a href={previewUrl} download={artifact.name} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          )}
          {!loading && !previewUrl && downloadUrl && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Preview not available for this file type
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90"
              >
                <a href={downloadUrl} download={artifact.name} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          )}
          {!loading && !downloadUrl && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">Unable to load preview</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {downloadUrl && (
            <Button asChild variant="outline">
              <a href={downloadUrl} download={artifact.name} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
