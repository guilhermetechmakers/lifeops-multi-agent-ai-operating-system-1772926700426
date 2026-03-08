/**
 * PRSummaryDrawer — slide-over drawer displaying PR title, summary, changes,
 * impacted files, risks, tests; action buttons for exporting or attaching artifacts.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitPullRequest,
  FileCode,
  AlertTriangle,
  TestTube,
  Download,
  Paperclip,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PR } from "@/types/projects";

export interface PRSummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pr: PR | null;
  onExport?: (pr: PR) => void;
  onAttachArtifact?: (pr: PR) => void;
  onSummarize?: (prId: string) => void;
  className?: string;
}

export function PRSummaryDrawer({
  open,
  onOpenChange,
  pr,
  onExport,
  onAttachArtifact,
  className,
}: PRSummaryDrawerProps) {
  const keyChanges = Array.isArray(pr?.keyChanges) ? pr.keyChanges : [];
  const risks = Array.isArray(pr?.risks) ? pr.risks : [];
  const tests = Array.isArray(pr?.tests) ? pr.tests : [];
  const impactedFiles = Array.isArray(pr?.impactedFiles) ? pr.impactedFiles : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md translate-x-0 translate-y-0 rounded-none border-l border-white/[0.03] bg-card p-0 gap-0 animate-in slide-in-from-right-2 duration-200",
          className
        )}
        showClose={true}
      >
        {pr ? (
          <>
            <DialogHeader className="p-4 pb-2 border-b border-white/[0.03] shrink-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                PR Summary
              </DialogTitle>
              <p className="text-sm font-medium text-foreground line-clamp-2 mt-1">
                {pr.title}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant={
                    pr.status === "merged"
                      ? "default"
                      : pr.status === "closed"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-[10px] capitalize"
                >
                  {pr.status}
                </Badge>
                {pr.authorName && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {pr.authorName}
                  </span>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {pr.summary && (
                  <section>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Summary
                    </h4>
                    <p className="text-sm text-foreground">{pr.summary}</p>
                  </section>
                )}

                {keyChanges.length > 0 && (
                  <section>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Key Changes
                    </h4>
                    <ul className="space-y-1.5">
                      {keyChanges.map((c, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground flex gap-2"
                        >
                          <span className="text-teal shrink-0">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {impactedFiles.length > 0 && (
                  <section>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileCode className="h-3.5 w-3.5" />
                      Impacted Files
                    </h4>
                    <ul className="space-y-1">
                      {impactedFiles.map((f, i) => (
                        <li
                          key={i}
                          className="text-xs font-mono text-muted-foreground truncate"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {risks.length > 0 && (
                  <section>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber" />
                      Risks
                    </h4>
                    <ul className="space-y-1.5">
                      {risks.map((r, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground flex gap-2"
                        >
                          <span className="text-amber shrink-0">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {tests.length > 0 && (
                  <section>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TestTube className="h-3.5 w-3.5 text-teal" />
                      Tests
                    </h4>
                    <ul className="space-y-1.5">
                      {tests.map((t, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground flex gap-2"
                        >
                          <span className="text-teal shrink-0">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {!pr.summary &&
                  keyChanges.length === 0 &&
                  risks.length === 0 &&
                  tests.length === 0 &&
                  impactedFiles.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No summary data yet. Run summarization to generate.
                    </div>
                  )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/[0.03] flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1 transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => onExport?.(pr)}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1 transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => onAttachArtifact?.(pr)}
              >
                <Paperclip className="h-4 w-4" />
                Attach artifact
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Select a PR to view summary
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
