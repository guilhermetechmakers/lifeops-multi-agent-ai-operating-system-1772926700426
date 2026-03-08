/**
 * Audit trail: threaded comments and approval history.
 */

import { formatDistanceToNow } from "date-fns";
import { MessageCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Comment, AuditEvent } from "@/types/approvals";

export interface AuditTrailProps {
  itemId: string;
  comments: Comment[] | null | undefined;
  audit: AuditEvent[] | null | undefined;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onAddComment: () => void;
  isSubmittingComment?: boolean;
  className?: string;
}

export function AuditTrail({
  comments,
  audit,
  newComment,
  onNewCommentChange,
  onAddComment,
  isSubmittingComment = false,
  className,
}: AuditTrailProps) {
  const commentList = Array.isArray(comments) ? comments : [];
  const auditList = Array.isArray(audit) ? audit : [];
  const sortedAudit = [...auditList].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastUpdated =
    sortedAudit.length > 0
      ? formatDistanceToNow(new Date(sortedAudit[0].timestamp), { addSuffix: true })
      : null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-white/[0.03] bg-secondary/20 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          Comments
        </h4>
        <div className="space-y-3">
          {commentList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            commentList.map((c) => (
              <div
                key={c.id}
                className="rounded border border-white/[0.03] bg-background/50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{c.authorName}</span>
                  <span>
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    {c.editedAt && " (edited)"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground">{c.text}</p>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-input border-white/[0.03]"
            aria-label="New comment"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onAddComment();
              }
            }}
          />
          <Button
            size="sm"
            onClick={onAddComment}
            disabled={!newComment.trim() || isSubmittingComment}
          >
            {isSubmittingComment ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.03] bg-secondary/20 p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Approval history
          </h4>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground" aria-live="polite">
              Last updated {lastUpdated}
            </span>
          )}
        </div>
        {auditList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit events yet.</p>
        ) : (
          <ul
            className="space-y-1 max-h-[280px] overflow-y-auto overflow-x-hidden pr-2"
            role="list"
            aria-label="Audit trail"
          >
            {sortedAudit.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground border-l-2 border-white/[0.06] pl-3 py-1.5"
              >
                <span className="font-medium text-foreground">{e.authorName}</span>
                <span>{e.type}</span>
                <span>
                  {formatDistanceToNow(new Date(e.timestamp), { addSuffix: true })}
                </span>
                {e.details && (
                  <span className="w-full text-xs mt-0.5">{e.details}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
