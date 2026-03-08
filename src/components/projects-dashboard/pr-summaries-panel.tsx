/**
 * PRSummariesPanel — open PRs with agent summaries and quick actions.
 */

import { GitPullRequest, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectPRs, useReviewPR } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { PR } from "@/types/projects";

export interface PRSummariesPanelProps {
  projectId: string;
  className?: string;
}

export function PRSummariesPanel({ projectId, className }: PRSummariesPanelProps) {
  const { items: prs, isLoading } = useProjectPRs(projectId);
  const reviewPR = useReviewPR(projectId);
  const prList = Array.isArray(prs) ? prs : [];
  const openPRs = prList.filter((p: PR) => p.status === "open");

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          PRs & Code Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        {openPRs.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No open PRs
          </div>
        ) : (
          <div className="space-y-3">
            {openPRs.map((pr) => (
              <div
                key={pr.id}
                className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
              >
                <p className="text-sm font-medium text-foreground line-clamp-1">{pr.title}</p>
                {pr.summary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pr.summary}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" aria-hidden />
                    {pr.authorName ?? "—"}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => reviewPR.mutate({ prId: pr.id, action: "approve" })}
                      disabled={reviewPR.isPending}
                      aria-label={`Approve PR: ${pr.title}`}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => reviewPR.mutate({ prId: pr.id, action: "comment" })}
                      disabled={reviewPR.isPending}
                      aria-label={`Review PR: ${pr.title}`}
                    >
                      Review
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => reviewPR.mutate({ prId: pr.id, action: "request_changes" })}
                      disabled={reviewPR.isPending}
                      aria-label={`Request changes: ${pr.title}`}
                    >
                      Request changes
                    </Button>
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
