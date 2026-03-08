/**
 * Approval detail panel: tabs for Rationale, Payload, Diffs, Artifacts, Trace, Comments.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionBar } from "./action-bar";
import { ConditionalEditor } from "./conditional-editor";
import { DiffsViewer } from "./diffs-viewer";
import { RunArtifactsPreview } from "./run-artifacts-preview";
import { InterAgentTracePanel } from "./inter-agent-trace-panel";
import { AuditTrail } from "./audit-trail";
import type { ApprovalQueueItem } from "@/types/approvals";

const TAB_KEYS = ["rationale", "payload", "diffs", "artifacts", "trace", "comments"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export interface ApprovalDetailPanelProps {
  item: ApprovalQueueItem | null;
  onClose: () => void;
  onApprove: (comment?: string) => void;
  onApproveWithConditions: (conditions: Record<string, unknown>, comment?: string) => void;
  onReject: (comment?: string) => void;
  onRequestChanges: (comment?: string, requiredChanges?: string[]) => void;
  onEscalate?: (comment?: string) => void;
  onRevert?: (reason?: string) => void;
  onAddComment: (text: string) => void;
  isActionPending?: boolean;
  isCommentPending?: boolean;
  className?: string;
}

function PayloadViewer({ payload }: { payload: Record<string, unknown> | undefined }) {
  if (!payload || Object.keys(payload).length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No payload</p>;
  }
  return (
    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap rounded-lg border border-white/[0.03] bg-secondary/20 p-4 overflow-x-auto">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}

export function ApprovalDetailPanel({
  item,
  onClose,
  onApprove,
  onApproveWithConditions,
  onReject,
  onRequestChanges,
  onEscalate,
  onRevert,
  onAddComment,
  isActionPending = false,
  isCommentPending = false,
  className,
}: ApprovalDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("rationale");
  const [showConditionalEditor, setShowConditionalEditor] = useState(false);
  const [commentForAction, setCommentForAction] = useState("");
  const [newComment, setNewComment] = useState("");

  if (!item) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardContent className="p-8 text-center text-muted-foreground">
          Select an item from the list
        </CardContent>
      </Card>
    );
  }

  const cronjobId = item.cronjobId ?? item.ownerId;
  const runDetailsUrl =
    item.runId && cronjobId
      ? `/dashboard/cronjobs/${cronjobId}/runs/${item.runId}`
      : undefined;

  const handleApprove = () => {
    onApprove(commentForAction || undefined);
    setCommentForAction("");
  };

  const handleReject = () => {
    onReject(commentForAction || undefined);
    setCommentForAction("");
  };

  const handleRequestChanges = () => {
    onRequestChanges(commentForAction || undefined);
    setCommentForAction("");
  };

  const handleEscalate = () => {
    onEscalate?.(commentForAction || undefined);
    setCommentForAction("");
  };

  const handleSubmitConditions = (conditions: Record<string, unknown>) => {
    onApproveWithConditions(conditions, commentForAction || undefined);
    setShowConditionalEditor(false);
    setCommentForAction("");
  };

  const handleAddComment = () => {
    const t = newComment.trim();
    if (t) {
      onAddComment(t);
      setNewComment("");
    }
  };

  const displayName = item.cronName ?? item.cronjob_name ?? "Approval";

  return (
    <Card className={cn("border-white/[0.03] bg-card flex flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-white/[0.03]">
        <div className="min-w-0">
          <CardTitle className="text-lg">{displayName}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.ownerName ?? item.agent ?? item.ownerId} · {item.module}
            {item.eta && (
              <> · ETA {new Date(item.eta).toLocaleString()}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {runDetailsUrl && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={runDetailsUrl}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Run details
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 pt-4">
        <ActionBar
          status={item.status}
          onApprove={handleApprove}
          onApproveWithConditions={() => setShowConditionalEditor(true)}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
          onEscalate={onEscalate ? handleEscalate : undefined}
          onRevert={onRevert}
          isPending={isActionPending}
          canRevert
          runId={item.runId}
          runDetailsUrl={runDetailsUrl}
        />

        <div className="space-y-2">
          <Label htmlFor="action-comment">Comment (optional) for approve / reject</Label>
          <input
            id="action-comment"
            type="text"
            value={commentForAction}
            onChange={(e) => setCommentForAction(e.target.value)}
            placeholder="Add a comment..."
            className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground"
          />
        </div>

        {showConditionalEditor && (
          <ConditionalEditor
            currentItemId={item.id}
            onSubmitConditions={handleSubmitConditions}
            onCancel={() => setShowConditionalEditor(false)}
            isLoading={isActionPending}
          />
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="bg-secondary/50 border border-white/[0.03] w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="rationale">Rationale</TabsTrigger>
            <TabsTrigger value="payload">Payload</TabsTrigger>
            <TabsTrigger value="diffs">Diffs</TabsTrigger>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="trace">Trace</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="rationale" className="mt-0">
              <p className="text-sm text-foreground whitespace-pre-wrap rounded-lg border border-white/[0.03] bg-secondary/20 p-4">
                {item.rationale || "No rationale provided."}
              </p>
            </TabsContent>
            <TabsContent value="payload" className="mt-0">
              <PayloadViewer payload={item.payload as Record<string, unknown>} />
            </TabsContent>
            <TabsContent value="diffs" className="mt-0">
              <DiffsViewer
                diffData={item.diffs}
                currentPayload={item.currentPayload ?? undefined}
                proposedPayload={
                  (item.inputPayload ?? item.payload) as Record<string, unknown> | undefined
                }
              />
            </TabsContent>
            <TabsContent value="artifacts" className="mt-0">
              <RunArtifactsPreview artifacts={item.artifacts} />
            </TabsContent>
            <TabsContent value="trace" className="mt-0">
              <InterAgentTracePanel trace={item.trace} />
            </TabsContent>
            <TabsContent value="comments" className="mt-0">
              <AuditTrail
                itemId={item.id}
                comments={item.comments}
                audit={item.audit}
                newComment={newComment}
                onNewCommentChange={setNewComment}
                onAddComment={handleAddComment}
                isSubmittingComment={isCommentPending}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
