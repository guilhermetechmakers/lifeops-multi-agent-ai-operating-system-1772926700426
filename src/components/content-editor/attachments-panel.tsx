/**
 * AttachmentsPanel — file upload with drag-and-drop, artifact versioning.
 */

import { useCallback, useRef } from "react";
import { Paperclip, Upload, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Artifact } from "@/types/content-editor";

const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/json",
];
const MAX_SIZE_MB = 10;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼";
  if (mimeType === "application/pdf") return "📄";
  return "📎";
}

export interface AttachmentsPanelProps {
  artifacts?: Artifact[];
  onUpload?: (formData: FormData, onProgress?: (pct: number) => void) => void;
  onDelete?: (artifactId: string) => void;
  isUploading?: boolean;
  className?: string;
}

export function AttachmentsPanel({
  artifacts = [],
  onUpload,
  onDelete,
  isUploading = false,
  className,
}: AttachmentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const items = Array.isArray(artifacts) ? artifacts : [];

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (validateFile(f)) formData.append("file", f);
      }
      if (formData.has("file")) onUpload?.(formData);
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (validateFile(f)) formData.append("file", f);
      }
      if (formData.has("file")) onUpload?.(formData);
      e.target.value = "";
    },
    [onUpload]
  );

  function validateFile(file: File): boolean {
    if (!ALLOWED_MIME.includes(file.type) && !file.type.startsWith("image/")) {
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return false;
    }
    return true;
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="h-4 w-4 text-purple" />
          Attachments
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Drag-and-drop or browse. Versioned per draft.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/[0.06] bg-secondary/20 p-6 transition-colors",
            "hover:border-white/[0.1] hover:bg-secondary/30"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept={ALLOWED_MIME.join(",")}
            onChange={handleSelect}
          />
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            Drop files here or{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => inputRef.current?.click()}
            >
              browse
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, images, text. Max {MAX_SIZE_MB}MB.
          </p>
        </div>

        {isUploading && (
          <p className="text-xs text-muted-foreground">Uploading...</p>
        )}

        {items.length === 0 && !isUploading ? (
          <p className="rounded-md border border-white/[0.03] bg-secondary/20 p-3 text-xs text-muted-foreground">
            No attachments yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-md border border-white/[0.03] bg-secondary/20 p-2"
                >
                  <span className="text-xl shrink-0">{getFileIcon(a.mimeType)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(a.size)} · v{a.version}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(a.url, "_blank")}
                      aria-label="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete?.(a.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
