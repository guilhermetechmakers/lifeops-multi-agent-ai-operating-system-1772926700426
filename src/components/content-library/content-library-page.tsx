/**
 * ContentLibraryPage — central repository for content assets and published items.
 * Search, filters, bulk actions, item detail drawer, pipeline integration.
 * All array operations guarded; useState<Type[]>([]).
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { ContentCard } from "./content-card";
import { FilterPanel } from "./filter-panel";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { ItemDetailDrawer } from "./item-detail-drawer";
import {
  useContentLibraryItems,
  useContentLibraryMetadata,
  useContentLibrarySelection,
  useContentItemPipelineState,
  useBulkActionContentLibrary,
} from "@/hooks/use-content-library";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ContentLibraryFilters, ContentItem, BulkActionType } from "@/types/content-library";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const DEBOUNCE_MS = 250;

export function ContentLibraryPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ContentLibraryFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);

  const {
    selectedIds,
    toggle,
    toggleAll: _toggleAll,
    clear: clearSelection,
    isSelected,
    selectedCount,
  } = useContentLibrarySelection();

  const { items, total: _total, isLoading, refetch } = useContentLibraryItems({
    search: debouncedSearch || undefined,
    filters,
    page: 1,
    limit: 50,
  });
  const { owners, channels, tags, platforms } = useContentLibraryMetadata();
  const bulkAction = useBulkActionContentLibrary();

  const itemList = Array.isArray(items) ? items : [];

  const { data: pipelineState } = useContentItemPipelineState(detailItem?.id ?? null);

  const handleFilterChange = useCallback((next: ContentLibraryFilters) => {
    setFilters(next);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      toggle(id);
    },
    [toggle]
  );

  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleOpenDetail = useCallback((item: ContentItem) => {
    setDetailItem(item);
    setDrawerOpen(true);
  }, []);

  const handleBulkAction = useCallback(
    async (action: BulkActionType) => {
      const ids = selectedIds ?? [];
      if (ids.length === 0) return;
      if (action === "export") {
        const toExport = itemList.filter((i) => ids.includes(i.id));
        const blob = new Blob([JSON.stringify(toExport, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `content-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${ids.length} item(s)`);
        clearSelection();
        return;
      }
      try {
        await bulkAction.mutateAsync({ ids, action });
        clearSelection();
        refetch();
      } catch {
        toast.error("Bulk action failed");
      }
    },
    [selectedIds, itemList, bulkAction, clearSelection, refetch]
  );

  const handleOpenInPipeline = useCallback(
    (id: string) => {
      navigate(`/dashboard/content/editor?itemId=${id}`);
      setDrawerOpen(false);
    },
    [navigate]
  );

  const handleViewArtifacts = useCallback((_id: string) => {
    toast.info("Artifacts view — open in pipeline for run history.");
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/dashboard/content/editor?itemId=${id}`);
      setDrawerOpen(false);
    },
    [navigate]
  );

  return (
    <AnimatedPage className="flex flex-col gap-6">
      <header className="flex flex-col gap-1" style={{ minHeight: "56px" }}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Content Library
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse, filter, and manage content assets. Bulk publish, archive, or export.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          owners={owners}
          channels={channels}
          tags={tags}
          platforms={platforms}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
        />

        {selectedCount > 0 && (
          <BulkActionToolbar
            selectedCount={selectedCount}
            onAction={handleBulkAction}
            onClearSelection={handleClearSelection}
            isPending={bulkAction.isPending}
          />
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {(Array.from({ length: 6 }) ?? []).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : itemList.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-card/50 py-16 px-6"
            role="status"
            aria-label="No content"
          >
            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
            <p className="text-sm font-medium text-foreground">No content found</p>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
              Try adjusting your filters or search. Create content from the Editor or Content
              Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(itemList ?? []).map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                selected={isSelected(item.id)}
                onSelect={handleSelect}
                onClick={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </div>

      <ItemDetailDrawer
        item={detailItem}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        pipelineState={pipelineState ?? undefined}
        onOpenInPipeline={handleOpenInPipeline}
        onViewArtifacts={handleViewArtifacts}
        onEdit={handleEdit}
      />
    </AnimatedPage>
  );
}
