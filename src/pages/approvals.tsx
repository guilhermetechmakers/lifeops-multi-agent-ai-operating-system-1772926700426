import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import { Check, X, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import {
  useApprovalsQueue,
  useApproveItem,
  useRejectItem,
  useConditionalApproveItem,
} from "@/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ApprovalItem } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";

function DiffView({ diff }: { diff?: Record<string, unknown> }) {
  const entries = diff && typeof diff === "object" ? Object.entries(diff) : [];
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No diff available</p>
    );
  }
  return (
    <div className="space-y-2 rounded-md border border-white/[0.03] bg-secondary/30 p-4 font-mono text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="text-muted-foreground">{key}:</span>
          <span className="text-foreground">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ApprovalDetailPanel({ item, onClose }: { item: ApprovalItem; onClose: () => void }) {
  const [comments, setComments] = useState("");
  const [showConditional, setShowConditional] = useState(false);
  const [conditionalKey, setConditionalKey] = useState("");
  const [conditionalValue, setConditionalValue] = useState("");

  const approve = useApproveItem();
  const reject = useRejectItem();
  const conditionalApprove = useConditionalApproveItem();

  const handleApprove = () => {
    approve.mutate({ id: item.id, comments: comments || undefined });
    onClose();
  };

  const handleReject = () => {
    reject.mutate({ id: item.id, comments: comments || undefined });
    onClose();
  };

  const handleConditionalApprove = () => {
    const conditions = conditionalKey
      ? { [conditionalKey]: conditionalValue }
      : {};
    conditionalApprove.mutate({
      id: item.id,
      conditions,
      comments: comments || undefined,
    });
    onClose();
  };

  const isPending = approve.isPending || reject.isPending || conditionalApprove.isPending;

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{item.cronjob_name ?? "Approval"}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.agent} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
          {item.urgency && (
            <Badge
              variant={
                item.urgency === "critical"
                  ? "destructive"
                  : item.urgency === "high"
                    ? "warning"
                    : "secondary"
              }
              className="mt-2"
            >
              {item.urgency}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Agent rationale</Label>
          <p className="mt-1 rounded-md border border-white/[0.03] bg-secondary/30 p-3 text-sm">
            {item.rationale}
          </p>
        </div>
        <div>
          <Label className="text-muted-foreground">Diff / Changes</Label>
          <div className="mt-2">
            <DiffView diff={item.diff_blob} />
          </div>
        </div>
        <div>
          <Label htmlFor="comments">Comments (optional)</Label>
          <Input
            id="comments"
            placeholder="Add a comment..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="mt-1 bg-input"
          />
        </div>
        {showConditional && (
          <div className="space-y-2 rounded-md border border-white/[0.03] bg-secondary/30 p-4">
            <Label>Conditional approval</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Condition key"
                value={conditionalKey}
                onChange={(e) => setConditionalKey(e.target.value)}
                className="bg-input"
              />
              <Input
                placeholder="Value"
                value={conditionalValue}
                onChange={(e) => setConditionalValue(e.target.value)}
                className="bg-input"
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={handleApprove}
            disabled={isPending}
          >
            <Check className="mr-1 h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/50"
            onClick={handleReject}
            disabled={isPending}
          >
            <X className="mr-1 h-4 w-4" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConditional(!showConditional)}
          >
            Conditional approve
          </Button>
          {showConditional && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleConditionalApprove}
              disabled={isPending}
            >
              Apply conditional
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Approvals() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { items, isLoading, isError } = useApprovalsQueue();
  const pendingItems = Array.isArray(items)
    ? items.filter((a) => a.status === "pending")
    : [];
  const selectedItem = selectedId
    ? (items ?? []).find((a) => a.id === selectedId)
    : null;

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Approvals queue</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve actions that require human-in-the-loop
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={cn("space-y-4", selectedItem && "lg:col-span-1")}>
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <CardTitle>Pending approvals</CardTitle>
              <p className="text-sm text-muted-foreground">
                {pendingItems.length} item(s) waiting for review
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))
              ) : isError ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Failed to load approvals
                </p>
              ) : pendingItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    No pending approvals. When agents suggest actions that require approval,
                    they'll appear here.
                  </p>
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-lg border border-white/[0.03] bg-secondary/50 transition-colors",
                      selectedId === item.id && "ring-2 ring-primary"
                    )}
                  >
                    <div
                      className="flex cursor-pointer flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => setSelectedId(item.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {item.cronjob_name ?? "Approval"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.agent} ·{" "}
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                        {item.urgency && (
                          <Badge
                            variant={
                              item.urgency === "critical"
                                ? "destructive"
                                : item.urgency === "high"
                                  ? "warning"
                                  : "secondary"
                            }
                            className="mt-2"
                          >
                            {item.urgency}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(item.id);
                        }}
                      >
                        {expandedIds.has(item.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {expandedIds.has(item.id) && (
                      <div className="border-t border-white/[0.03] px-4 py-3">
                        <p className="text-sm text-muted-foreground">{item.rationale}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {selectedItem && (
          <div className="lg:col-span-2">
            <ApprovalDetailPanel
              item={selectedItem}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
