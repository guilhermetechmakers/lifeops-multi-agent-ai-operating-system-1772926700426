/**
 * RepoLinksManager — add/edit repository URL mappings and branch patterns.
 */

import { useState } from "react";
import { GitBranch, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { RepoLink } from "@/types/integrations";

export interface RepoLinksManagerProps {
  repoLinks: RepoLink[];
  onSave: (data: Partial<RepoLink>) => Promise<void>;
  className?: string;
}

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export function RepoLinksManager({
  repoLinks = [],
  onSave,
  className,
}: RepoLinksManagerProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [branchPattern, setBranchPattern] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = Array.isArray(repoLinks) ? repoLinks : [];

  const handleAdd = () => {
    setUrl("");
    setBranchPattern("");
    setError(null);
    setOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    if (!url.trim()) {
      setError("URL is required");
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError("Invalid URL");
      return;
    }
    setSaving(true);
    try {
      await onSave({ url: url.trim(), branchPattern: branchPattern.trim() || undefined });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-muted-foreground" />
              Repository links
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/[0.03]"
              onClick={handleAdd}
              aria-label="Add repository link"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No repository links. Add one to connect your repo.
            </p>
          ) : (
            <div className="space-y-2">
              {(list as RepoLink[]).map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{link.url}</p>
                    {link.branchPattern && (
                      <p className="text-xs text-muted-foreground">Branches: {link.branchPattern}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/[0.03] bg-card" showClose={true}>
          <DialogHeader>
            <DialogTitle>Add repository link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Repository URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="border-white/[0.03]"
                aria-label="Repository URL"
              />
            </div>
            <div className="grid gap-2">
              <Label>Branch pattern (optional)</Label>
              <Input
                value={branchPattern}
                onChange={(e) => setBranchPattern(e.target.value)}
                placeholder="main|develop"
                className="border-white/[0.03]"
                aria-label="Branch pattern"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
