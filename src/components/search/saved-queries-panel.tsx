/**
 * Saved Queries: list, create, edit, delete, run. Shareable links; respects access boundaries.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Plus, Play, Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSearchContext } from "@/contexts/search-context";
import {
  useSavedQueries,
  useCreateSavedQuery,
  useUpdateSavedQuery,
  useDeleteSavedQuery,
} from "@/hooks/use-search";
import type { SavedQuery, SearchModule } from "@/types/search";

const SEARCH_MODULES: SearchModule[] = ["content", "cronjobs", "projects", "runs", "users"];
function asSearchModule(s: string | undefined): SearchModule | undefined {
  if (!s) return undefined;
  return SEARCH_MODULES.includes(s as SearchModule) ? (s as SearchModule) : undefined;
}

export interface SavedQueriesPanelProps {
  className?: string;
  /** When true, show "New" button and create dialog */
  showCreate?: boolean;
  /** Compact list (e.g. for sidebar) vs full cards */
  compact?: boolean;
}

export function SavedQueriesPanel({
  className,
  showCreate = true,
  compact = false,
}: SavedQueriesPanelProps) {
  const { items, isLoading } = useSavedQueries();
  const { setQuery, setScope, setModule, runSavedQuery } = useSearchContext();
  const createMutation = useCreateSavedQuery();
  const updateMutation = useUpdateSavedQuery();
  const deleteMutation = useDeleteSavedQuery();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SavedQuery | null>(null);
  const [formName, setFormName] = useState("");
  const [formQuery, setFormQuery] = useState("");
  const [formScope, setFormScope] = useState<"global" | "module">("global");
  const [formModule, setFormModule] = useState("");
  const [formShared, setFormShared] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormName("");
    setFormQuery("");
    setFormScope("global");
    setFormModule("");
    setFormShared(false);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((sq: SavedQuery) => {
    setEditing(sq);
    setFormName(sq.name ?? "");
    setFormQuery(sq.query ?? "");
    setFormScope((sq.scope as "global" | "module") ?? "global");
    setFormModule(sq.module ?? "");
    setFormShared(sq.isShared ?? false);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formQuery.trim()) return;
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          body: {
            name: formName.trim(),
            query: formQuery.trim(),
            scope: formScope,
            module: asSearchModule(formModule || undefined),
            isShared: formShared,
          },
        },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(
        {
          name: formName.trim(),
          query: formQuery.trim(),
          scope: formScope,
          module: asSearchModule(formModule || undefined),
          isShared: formShared,
        },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  }, [editing, formName, formQuery, formScope, formModule, formShared, updateMutation, createMutation]);

  const handleRun = useCallback(
    async (sq: SavedQuery) => {
      setQuery(sq.query ?? "");
      setScope((sq.scope as "global" | "module") ?? "global");
      setModule(sq.module ?? undefined);
      await runSavedQuery(sq.id);
      navigate("/dashboard/search");
    },
    [setQuery, setScope, setModule, runSavedQuery, navigate]
  );

  const handleDelete = useCallback(
    (sq: SavedQuery) => {
      if (window.confirm(`Delete saved query "${sq.name}"?`)) {
        deleteMutation.mutate(sq.id);
      }
    },
    [deleteMutation]
  );

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" aria-hidden />
          Saved queries
        </CardTitle>
        {showCreate && (
          <Button variant="ghost" size="sm" className="h-8" onClick={openCreate} aria-label="Create saved query">
            <Plus className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4">Loading...</div>
        ) : safeItems.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">
            No saved queries. Run a search and save it for quick access.
          </div>
        ) : (
          <ScrollArea className={compact ? "h-[200px]" : "max-h-[320px]"}>
            <ul className="space-y-1" role="list">
              {safeItems.map((sq) => (
                <li key={sq.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md border border-transparent hover:border-white/[0.03] hover:bg-secondary/50 px-2 py-1.5 transition-colors group",
                      compact && "py-1"
                    )}
                  >
                    <button
                      type="button"
                      className="flex-1 text-left text-sm truncate min-w-0"
                      onClick={() => handleRun(sq)}
                      title={sq.description ?? sq.name}
                    >
                      {sq.name}
                    </button>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRun(sq)}
                        aria-label={`Run ${sq.name}`}
                      >
                        <Play className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(sq)}
                        aria-label={`Edit ${sq.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(sq)}
                        aria-label={`Delete ${sq.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit saved query" : "Save query"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sq-name">Name</Label>
              <Input
                id="sq-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Pending content approvals"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sq-query">Query</Label>
              <Input
                id="sq-query"
                value={formQuery}
                onChange={(e) => setFormQuery(e.target.value)}
                placeholder="Search text"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={formScope === "global"}
                  onChange={() => setFormScope("global")}
                  className="rounded-full border-input"
                />
                Global
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={formScope === "module"}
                  onChange={() => setFormScope("module")}
                  className="rounded-full border-input"
                />
                Module
              </label>
            </div>
            {formScope === "module" && (
              <div className="grid gap-2">
                <Label htmlFor="sq-module">Module</Label>
                <Input
                  id="sq-module"
                  value={formModule}
                  onChange={(e) => setFormModule(e.target.value)}
                  placeholder="content, cronjobs, projects..."
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formShared}
                onChange={(e) => setFormShared(e.target.checked)}
                className="rounded border-input"
              />
              <Share2 className="h-4 w-4 text-muted-foreground" aria-hidden />
              Share with team
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formName.trim() || !formQuery.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {editing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
