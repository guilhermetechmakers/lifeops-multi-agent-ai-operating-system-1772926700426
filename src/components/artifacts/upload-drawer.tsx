/**
 * Upload Drawer — drag-and-drop file upload with progress and validation.
 * LifeOps design system; accessible; keyboard support.
 */

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadArtifact } from "@/hooks/use-artifacts";
import { formatFileSize } from "@/lib/format";

const MAX_SIZE_MB = 50;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/*",
  "application/pdf",
  "text/*",
  "application/json",
  "application/javascript",
  "application/xml",
];

export interface UploadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentItemId?: string;
  onUploadComplete?: () => void;
}

interface PendingFile {
  file: File;
  id: string;
  error?: string;
  progress?: number;
}

function validateFile(file: File): string | null {
  if (file.size > MAX_SIZE) {
    return `File exceeds ${MAX_SIZE_MB}MB limit`;
  }
  return null;
}

export function UploadDrawer({
  open,
  onOpenChange,
  contentItemId,
  onUploadComplete,
}: UploadDrawerProps) {
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadArtifact();

  const addFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const next: PendingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const err = validateFile(file);
      next.push({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${i}`,
        error: err ?? undefined,
      });
    }
    setPending((prev) => [...prev, ...next]);
  }, []);

  const removePending = useCallback((id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const valid = (pending ?? []).filter((p) => !p.error);
    if (valid.length === 0) return;

    for (const { file, id } of valid) {
      const formData = new FormData();
      formData.append("file", file);
      if (description) formData.append("description", description);
      if (tags) formData.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)));
      if (contentItemId) formData.append("contentItemId", contentItemId);

      setPending((prev) =>
        prev.map((p) => (p.id === id ? { ...p, progress: 0 } : p))
      );

      try {
        await upload.mutateAsync({
          formData,
          onProgress: (pct) => {
            setPending((prev) =>
              prev.map((p) => (p.id === id ? { ...p, progress: pct } : p))
            );
          },
        });
        removePending(id);
      } catch {
        setPending((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, error: "Upload failed" } : p
          )
        );
      }
    }

    const remaining = (pending ?? []).filter((p) => !p.error);
    if (remaining.length === 0) {
      onUploadComplete?.();
      onOpenChange(false);
      setPending([]);
      setDescription("");
      setTags("");
    }
  }, [pending, description, tags, contentItemId, upload, removePending, onOpenChange, onUploadComplete]);

  const validCount = (pending ?? []).filter((p) => !p.error).length;
  const canSubmit = validCount > 0 && !upload.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-fade-in" showClose>
        <DialogHeader>
          <DialogTitle>Upload artifacts</DialogTitle>
          <DialogDescription>
            Drag and drop files or click to select. Max {MAX_SIZE_MB}MB per file.
          </DialogDescription>
        </DialogHeader>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/[0.08] bg-secondary/50 py-12 px-6 transition-colors duration-200",
            isDragging && "border-primary/50 bg-primary/5",
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          onClick={() => inputRef.current?.click()}
          aria-label="Drop zone for file upload. Click or press Enter to select files."
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Drop files here or click to browse
          </p>
        </div>

        {Array.isArray(pending) && pending.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="artifact-desc">Description (optional)</Label>
              <Input
                id="artifact-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                className="bg-secondary border-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artifact-tags">Tags (comma-separated)</Label>
              <Input
                id="artifact-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. draft, research"
                className="bg-secondary border-white/[0.03]"
              />
            </div>
          </div>
        )}

        {Array.isArray(pending) && pending.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {pending.length} file(s) selected
            </p>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {pending.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2 text-sm"
                >
                  <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-foreground">
                    {p.file.name}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {formatFileSize(p.file.size)}
                  </span>
                  {p.error && (
                    <span className="text-destructive text-xs shrink-0">
                      {p.error}
                    </span>
                  )}
                  {p.progress != null && p.progress < 100 && (
                    <Progress value={p.progress} className="w-16 h-1.5" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePending(p.id);
                    }}
                    aria-label={`Remove ${p.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            {upload.isPending ? "Uploading…" : `Upload ${validCount} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
