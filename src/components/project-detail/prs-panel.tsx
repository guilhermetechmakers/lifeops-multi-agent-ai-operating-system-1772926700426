/**
 * PRsPanel — list of PRs with summarize action, status, checks.
 */

import { Link } from "react-router-dom";
import { GitPullRequest, User, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectPRs } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { PR } from "@/types/projects";

export interface PRsPanelProps {
  projectId: string;
  onSummarize?: (prId: string) => void;
  className?: string;
}

export function PRsPanel({ projectId, onSummarize, className }: PRsPanelProps) {
  const { items: prs, isLoading } = useProjectPRs(projectId);
  const list = prs ?? [];

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
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
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
                  <div className="flex gap-1">
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
  );
}
