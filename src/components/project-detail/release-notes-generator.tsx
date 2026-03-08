/**
 * ReleaseNotesGenerator — template-driven composer with per-PR/issue grouping,
 * changelog sections, and export options (Markdown, PDF via print).
 */

import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Copy, Printer } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PR, Release } from "@/types/projects";

const CHANGELOG_SECTIONS = [
  { id: "features", label: "Features" },
  { id: "fixes", label: "Bug Fixes" },
  { id: "chore", label: "Chores" },
  { id: "docs", label: "Documentation" },
  { id: "other", label: "Other" },
] as const;

export interface ReleaseNotesGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  prs: PR[];
  releases: Release[];
  version?: string;
  className?: string;
}

export function ReleaseNotesGenerator({
  open,
  onOpenChange,
  prs,
  releases,
  version: initialVersion,
  className,
}: ReleaseNotesGeneratorProps) {
  const prList = Array.isArray(prs) ? prs : [];
  const releaseList = Array.isArray(releases) ? releases : [];
  const [version, setVersion] = useState(
    initialVersion ?? releaseList[0]?.version ?? ""
  );
  const [notes, setNotes] = useState("");
  const [sectionMapping, setSectionMapping] = useState<
    Record<string, string>
  >({});

  const mergedPRs = prList.filter((p) => p.status === "merged");

  const markdown = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# Release ${version || "Unreleased"}`);
    lines.push("");
    if (notes.trim()) {
      lines.push(notes.trim());
      lines.push("");
    }
    for (const section of CHANGELOG_SECTIONS) {
      const prsInSection = mergedPRs.filter(
        (p) => (sectionMapping[p.id] ?? "other") === section.id
      );
      if (prsInSection.length > 0) {
        lines.push(`## ${section.label}`);
        lines.push("");
        for (const pr of prsInSection) {
          lines.push(`- ${pr.title} (#${pr.id})`);
          if (pr.summary) {
            lines.push(`  - ${pr.summary}`);
          }
        }
        lines.push("");
      }
    }
    const uncategorized = mergedPRs.filter(
      (p) => !sectionMapping[p.id] || sectionMapping[p.id] === "other"
    );
    if (uncategorized.length > 0 && !sectionMapping[uncategorized[0]?.id ?? ""]) {
      const hasOther = mergedPRs.some((p) => sectionMapping[p.id] === "other");
      if (!hasOther) {
        lines.push("## Other");
        lines.push("");
        for (const pr of uncategorized) {
          lines.push(`- ${pr.title} (#${pr.id})`);
        }
      }
    }
    return lines.join("\n");
  }, [version, notes, mergedPRs, sectionMapping]);

  const handleExportMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `release-notes-${version || "unreleased"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown exported");
  }, [markdown, version]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    toast.success("Copied to clipboard");
  }, [markdown]);

  const handlePrint = useCallback(() => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Release Notes - ${version || "Unreleased"}</title></head>
        <body style="font-family: Inter, sans-serif; padding: 24px; max-width: 720px; margin: 0 auto;">
        <pre style="white-space: pre-wrap; font-size: 14px;">${markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body>
        </html>
      `);
      w.document.close();
      w.print();
      w.close();
    }
    toast.success("Open print dialog to save as PDF");
  }, [markdown, version]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] flex flex-col border-white/[0.03] bg-card",
          className
        )}
        showClose={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Release Notes Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="rn-version">Version</Label>
            <Input
              id="rn-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 1.2.0"
              className="border-white/[0.03] bg-secondary/30"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rn-notes">Release notes (intro)</Label>
            <Textarea
              id="rn-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief summary of this release..."
              rows={3}
              className="border-white/[0.03] bg-secondary/30 resize-none"
            />
          </div>
          {mergedPRs.length > 0 && (
            <div className="grid gap-2">
              <Label>Group PRs by section</Label>
              <ScrollArea className="h-32 rounded-md border border-white/[0.03] bg-secondary/30 p-2">
                <div className="space-y-2">
                  {mergedPRs.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="flex-1 truncate">{pr.title}</span>
                      <Select
                        value={sectionMapping[pr.id] ?? "other"}
                        onValueChange={(v) =>
                          setSectionMapping((prev) => ({
                            ...prev,
                            [pr.id]: v,
                          }))
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANGELOG_SECTIONS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          {mergedPRs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No merged PRs to include. Merge PRs first or add notes manually.
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 transition-transform duration-200 hover:scale-[1.02]"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 transition-transform duration-200 hover:scale-[1.02]"
            onClick={handleExportMarkdown}
          >
            <Download className="h-4 w-4" />
            Export Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 transition-transform duration-200 hover:scale-[1.02]"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print / PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
