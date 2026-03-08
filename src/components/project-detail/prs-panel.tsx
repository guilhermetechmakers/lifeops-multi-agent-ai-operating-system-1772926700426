/**
 * PRsPanel — list of PRs with summarize action, status, checks.
 * Opens PR Summary Drawer on click.
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { GitPullRequest, User, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectPRs } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { PRSummaryDrawer } from "./pr-summary-drawer";
import type { PR } from "@/types/projects";

export interface PRsPanelProps {
  projectId: string;
  onSummarize?: (prId: string) => void;
  className?: string;
}

export function PRsPanel({ projectId, onSummarize, className }: PRsPanelProps) {
  const { items: prs, isLoading } = useProjectPRs(projectId);
  const list = prs ?? [];
  const [selectedPR, setSelectedPR] = useState<PR | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenPR = useCallback((pr: PR) => {
    setSelectedPR(pr);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedPR(null);
  }, []);

  if (isLoading) {
    return (
      <Card className={cn("card-project-detail", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className={cn("card-project-detail", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          Pull Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No PRs
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((pr: PR) => (
              <div
                key={pr.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenPR(pr)}
                onKeyDown={(e) => e.key === "Enter" && handleOpenPR(pr)}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-all duration-200 hover:bg-secondary/50 hover:shadow-card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground line-clamp-1 flex-1">
                    {pr.title}
                  </p>
                  <Badge
                    variant={
                      pr.status === "merged"
                        ? "success"
                        : pr.status === "closed"
                        ? "secondary"
                        : "default"
                    }
                    className="text-[10px] shrink-0 capitalize"
                  >
                    {pr.status}
                  </Badge>
                </div>
                {(pr.summary ?? pr.checksSummary) && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {pr.summary ?? pr.checksSummary}
                  </p>
                )}
                {Array.isArray(pr.linkedTicketIds) && pr.linkedTicketIds.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Linked: {pr.linkedTicketIds.length} ticket{pr.linkedTicketIds.length !== 1 ? "s" : ""}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {pr.authorName ?? "—"}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleOpenPR(pr)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Summary
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => onSummarize?.(pr.id)}
                    >
                      <FileText className="h-3 w-3" />
                      Summarize
                    </Button>
                    <Link to={`/dashboard/runs/${pr.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <PRSummaryDrawer
      pr={selectedPR}
      open={drawerOpen}
      onOpenChange={(open) => !open && handleCloseDrawer()}
      onExport={(p) => {
        const blob = new Blob(
          [
            JSON.stringify(
              {
                title: p.title,
                summary: p.summary,
                keyChanges: p.keyChanges,
                risks: p.risks,
                tests: p.tests,
                impactedFiles: p.impactedFiles,
              },
              null,
              2
            ),
          ],
          { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pr-summary-${p.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }}
    />
    </>
  );
}
