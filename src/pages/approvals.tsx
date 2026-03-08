/**
 * Approvals Queue page: list of items requiring review with detail panel.
 * Filters in URL; two-pane layout (list | detail); responsive drawer on narrow.
 */

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiltersBar,
  ItemCardRow,
  EmptyState,
  ApprovalDetailPanel,
} from "@/components/approvals-queue";
import {
  useApprovalsQueue,
  useApprovalsQueueFilters,
  useApprovalItem,
  useApproveApprovalItem,
  useApproveWithConditionsApprovalItem,
  useRejectApprovalItem,
  useRequestChangesApprovalItem,
  useRevertApprovalItem,
  useAddApprovalComment,
} from "@/hooks/use-approvals-queue";
import { cn } from "@/lib/utils";

const ITEM_PARAM = "itemId";

export default function Approvals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get(ITEM_PARAM) ?? null;

  const [filters, setFilters] = useApprovalsQueueFilters();
  const { items, total, isLoading, isError } = useApprovalsQueue();
  const { data: detailItem, isLoading: isDetailLoading } = useApprovalItem(selectedId);

  const approveMutation = useApproveApprovalItem();
  const conditionalApproveMutation = useApproveWithConditionsApprovalItem();
  const rejectMutation = useRejectApprovalItem();
  const requestChangesMutation = useRequestChangesApprovalItem();
  const revertMutation = useRevertApprovalItem();
  const addCommentMutation = useAddApprovalComment();

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    if (detailItem) return detailItem;
    return (items ?? []).find((i) => i.id === selectedId) ?? null;
  }, [selectedId, detailItem, items]);

  const setSelectedId = (id: string | null) => {
    if (id) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(ITEM_PARAM, id);
        return next;
      });
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete(ITEM_PARAM);
        return next;
      });
    }
  };

  const hasFilters = Boolean(
    filters.search ?? filters.severity ?? filters.status ?? filters.owner ?? filters.cronName ?? filters.module
  );

  const handleApprove = (comment?: string) => {
    if (!selectedId) return;
    approveMutation.mutate(
      { id: selectedId, payload: { comment } },
      {
        onSuccess: () => setSelectedId(null),
      }
    );
  };

  const handleApproveWithConditions = (
    conditions: Record<string, unknown>,
    comment?: string
  ) => {
    if (!selectedId) return;
    conditionalApproveMutation.mutate(
      { id: selectedId, payload: { conditions, comment } },
      { onSuccess: () => setSelectedId(null) }
    );
  };

  const handleReject = (comment?: string) => {
    if (!selectedId) return;
    rejectMutation.mutate(
      { id: selectedId, payload: { comment } },
      { onSuccess: () => setSelectedId(null) }
    );
  };

  const handleRequestChanges = (comment?: string, _requiredChanges?: string[]) => {
    if (!selectedId) return;
    requestChangesMutation.mutate(
      { id: selectedId, payload: { comment, requiredChanges: _requiredChanges } },
      { onSuccess: () => setSelectedId(null) }
    );
  };

  const handleRevert = (reason?: string) => {
    if (!selectedId) return;
    revertMutation.mutate({ id: selectedId, payload: { reason } });
  };

  const handleAddComment = (text: string) => {
    if (!selectedId) return;
    addCommentMutation.mutate({ id: selectedId, payload: { text } });
  };

  const isActionPending =
    approveMutation.isPending ||
    conditionalApproveMutation.isPending ||
    rejectMutation.isPending ||
    requestChangesMutation.isPending ||
    revertMutation.isPending;

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Approvals queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve scheduled actions and cron runs that require human review
        </p>
      </div>

      <FiltersBar filters={filters} onFiltersChange={setFilters} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className={cn("flex flex-col min-h-0", selectedItem && "lg:col-span-1")}>
          <div className="rounded-lg border border-white/[0.03] bg-card p-4">
            <h2 className="text-base font-semibold text-foreground">
              Queue ({total})
            </h2>
            {isLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Failed to load approvals
              </p>
            ) : !items || items.length === 0 ? (
              <EmptyState
                hasFilters={hasFilters}
                onClearFilters={() =>
                  setFilters({
                    search: undefined,
                    severity: undefined,
                    status: undefined,
                    owner: undefined,
                    cronName: undefined,
                    module: undefined,
                    page: 1,
                  })
                }
                className="mt-4"
              />
            ) : (
              <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto">
                {(items ?? []).map((item) => (
                  <ItemCardRow
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "min-h-0 flex flex-col",
            selectedItem ? "lg:col-span-1" : "hidden lg:block"
          )}
        >
          {selectedId && !selectedItem && isDetailLoading ? (
            <div className="rounded-lg border border-white/[0.03] bg-card p-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <ApprovalDetailPanel
              item={selectedItem}
              onClose={() => setSelectedId(null)}
              onApprove={handleApprove}
              onApproveWithConditions={handleApproveWithConditions}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onRevert={handleRevert}
              onAddComment={handleAddComment}
              isActionPending={isActionPending}
              isCommentPending={addCommentMutation.isPending}
              className="h-full min-h-[400px]"
            />
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
