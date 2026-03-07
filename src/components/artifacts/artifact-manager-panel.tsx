/**
 * Artifact Manager Panel — list/grid of artifacts with filters, actions, bulk operations.
 * LifeOps design system; responsive; loading skeletons; empty state.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  MoreVertical,
  Download,
  Trash2,
  Shield,
  Grid3X3,
  List,
  Search,
  FileText,
  Image,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize, formatDate } from "@/lib/format";
import { getDownloadUrl } from "@/api/artifacts";
import { useArtifactList, useDeleteArtifact, useTriggerScan } from "@/hooks/use-artifacts";
import { UploadDrawer } from "./upload-drawer";
import { ArtifactViewer } from "./artifact-viewer";
import type { Artifact, ArtifactStatus } from "@/types/artifact";

const STATUS_VARIANTS: Record<ArtifactStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  pending_scan: "secondary",
  clean: "success",
  infected: "destructive",
  quarantined: "warning",
  deleted: "secondary",
};

function getFileIcon(type: string) {
  const t = (type ?? "").toLowerCase();
  if (t.includes("image")) return Image;
  if (t.includes("text") || t.includes("json") || t.includes("xml")) return FileCode;
  return FileText;
}

export interface ArtifactManagerPanelProps {
  contentItemId?: string;
  tenantId?: string;
  compact?: boolean;
}

export function ArtifactManagerPanel({
  contentItemId,
  tenantId,
  compact = false,
}: ArtifactManagerPanelProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerArtifact, setViewerArtifact] = useState<Artifact | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Artifact | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArtifactStatus | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading, error } = useArtifactList({
    contentItemId,
    tenantId,
    status: statusFilter || undefined,
    page: 1,
    pageSize: 50,
  });

  const deleteMutation = useDeleteArtifact();
  const scanMutation = useTriggerScan();

  const artifacts = (data?.artifacts ?? []).filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.name ?? "").toLowerCase().includes(q) ||
      (a.description ?? "").toLowerCase().includes(q) ||
      (a.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleDownload = async (a: Artifact) => {
    try {
      const res = await getDownloadUrl(a.id);
      if (res?.url) window.open(res.url, "_blank");
    } catch {
      // toast handled by caller if needed
    }
  };

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-heading-md">Artifacts</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3X3 className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!compact && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search artifacts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary border-white/[0.03]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ArtifactStatus | "")}
              className="h-10 rounded-md border border-input bg-secondary px-3 text-sm text-foreground"
            >
              <option value="">All statuses</option>
              <option value="pending_scan">Pending scan</option>
              <option value="clean">Clean</option>
              <option value="infected">Infected</option>
              <option value="quarantined">Quarantined</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {isLoading && (
          <div className={cn("grid gap-4", viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "space-y-2")}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (!Array.isArray(artifacts) || artifacts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-white/[0.08] bg-secondary/30">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No artifacts yet</p>
            <Button onClick={() => setUploadOpen(true)} variant="outline">
              Upload your first artifact
            </Button>
          </div>
        )}

        {!isLoading && Array.isArray(artifacts) && artifacts.length > 0 && (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-2"
            )}
          >
            {artifacts.map((a) => {
              const Icon = getFileIcon(a.type);
              return (
                <div
                  key={a.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border border-white/[0.03] bg-secondary/30 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
                    viewMode === "list" && "flex-row"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setViewerArtifact(a);
                      setViewerOpen(true);
                    }}
                    className="flex shrink-0 items-center justify-center h-12 w-12 rounded-lg bg-secondary border border-white/[0.03] hover:bg-secondary/80 transition-colors"
                    aria-label={`View ${a.name}`}
                  >
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(a.size ?? 0)} · {formatDate(a.createdAt ?? "")}
                    </p>
                    <Badge
                      variant={STATUS_VARIANTS[a.status ?? "pending_scan"] ?? "secondary"}
                      className="mt-1 text-[10px]"
                    >
                      {a.status ?? "pending_scan"}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(a)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setViewerArtifact(a);
                          setViewerOpen(true);
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => scanMutation.mutate(a.id)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <UploadDrawer
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        contentItemId={contentItemId}
        onUploadComplete={() => {
          /* list refetches via query invalidation */
        }}
      />

      <ArtifactViewer
        artifact={viewerArtifact}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete artifact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete &quot;{deleteTarget?.name}&quot;. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
