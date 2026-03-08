/**
 * Cronjobs Dashboard: searchable, filterable, sortable list with bulk actions,
 * Schedule Builder, Quick Create, and performance panel.
 */

import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import {
  CronjobsListTable,
  CronjobsCardGrid,
  BulkActionsBar,
  QuickCreateModal,
  CronjobsFilterBar,
  ScheduleBuilderPanel,
  PerformancePanel,
} from "@/components/cronjobs";
import {
  useCronjobsList,
  useUpdateCronjob,
  useRunNowCronjob,
  useDeleteCronjob,
  useBulkCronjobs,
  useCreateCronjob,
  useCronjobsStats,
} from "@/hooks/use-cronjobs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Cronjob, CronjobFilters } from "@/types/cronjob";

const PAGE_SIZE = 20;

export default function CronjobsDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CronjobFilters>({ status: "all" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showScheduleBuilder, setShowScheduleBuilder] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  const listParams = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
      page,
      pageSize: PAGE_SIZE,
    }),
    [filters, debouncedSearch, page]
  );

  const {
    items,
    count,
    page: currentPage,
    pageSize,
    isLoading,
  } = useCronjobsList(listParams);

  const updateCronjob = useUpdateCronjob();
  const runNow = useRunNowCronjob();
  const deleteCronjob = useDeleteCronjob();
  const bulkCronjobs = useBulkCronjobs();
  const createCronjob = useCreateCronjob();
  const { runsLast24h } = useCronjobsStats();

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const enabledCount = useMemo(
    () => (items ?? []).filter((j: Cronjob) => j.enabled).length,
    [items]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const list = items ?? [];
    if (selectedIds.size === list.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(list.map((j: Cronjob) => j.id)));
    }
  }, [items, selectedIds.size]);

  const handleRunNow = useCallback(
    (id: string) => {
      runNow.mutate(id);
    },
    [runNow]
  );

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/dashboard/cronjobs/${id}/edit`);
    },
    [navigate]
  );

  const handleClone = useCallback(
    async (id: string) => {
      const job = (items ?? []).find((j: Cronjob) => j.id === id);
      if (!job) return;
      try {
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = job;
        const result = await createCronjob.mutateAsync({
          ...rest,
          name: `${job.name} (copy)`,
        });
        if (result?.id) navigate(`/dashboard/cronjobs/${result.id}/edit`);
      } catch {
        // Handled by mutation
      }
    },
    [items, navigate, createCronjob]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteCronjob.mutate(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [deleteCronjob]
  );

  const handleToggleEnabled = useCallback(
    (id: string, enabled: boolean) => {
      updateCronjob.mutate({ id, payload: { enabled } });
    },
    [updateCronjob]
  );

  const handleBulkEnable = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkCronjobs.mutate({ ids, action: "enable" });
    setSelectedIds(new Set());
  }, [selectedIds, bulkCronjobs]);

  const handleBulkDisable = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkCronjobs.mutate({ ids, action: "disable" });
    setSelectedIds(new Set());
  }, [selectedIds, bulkCronjobs]);

  const handleBulkRunNow = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkCronjobs.mutate({ ids, action: "run-now" });
    setSelectedIds(new Set());
  }, [selectedIds, bulkCronjobs]);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkCronjobs.mutate({ ids, action: "delete" });
    setSelectedIds(new Set());
  }, [selectedIds, bulkCronjobs]);

  const handleBulkClone = useCallback(() => {
    const ids = Array.from(selectedIds);
    bulkCronjobs.mutate({ ids, action: "clone" });
    setSelectedIds(new Set());
  }, [selectedIds, bulkCronjobs]);

  const clearFilters = useCallback(() => {
    setFilters({ status: "all" });
    setSearch("");
  }, []);

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cronjobs</h1>
          <p className="text-sm text-muted-foreground">
            Manage scheduled and event-triggered automations
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScheduleBuilder(!showScheduleBuilder)}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule Builder
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 gap-2 transition-transform hover:scale-[1.02]"
            onClick={() => setShowQuickCreate(true)}
          >
            <Plus className="h-4 w-4" />
            Quick Create
          </Button>
          <Link to="/dashboard/cronjobs/new">
            <Button variant="outline" size="sm" className="gap-2">
              Full editor
            </Button>
          </Link>
        </div>
      </div>

      {showScheduleBuilder && (
        <ScheduleBuilderPanel
          value={{ expression: "0 9 * * 1-5", timezone: "UTC" }}
          onChange={() => {}}
          showPresets={true}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{count}</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{enabledCount}</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Runs (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{runsLast24h}</div>
          </CardContent>
        </Card>
      </div>

      <CronjobsFilterBar
        filters={filters}
        search={search}
        onFiltersChange={setFilters}
        onSearchChange={setSearch}
        onClear={clearFilters}
      />

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onEnable={handleBulkEnable}
        onDisable={handleBulkDisable}
        onRunNow={handleBulkRunNow}
        onClone={handleBulkClone}
        onDelete={handleBulkDelete}
        isPending={bulkCronjobs.isPending}
      />

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Cronjob list</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click to edit or view runs · Table on desktop, cards on mobile
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (items ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No cronjobs match your filters.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting filters or create a new cronjob.
              </p>
              <Button
                className="mt-4 bg-primary hover:bg-primary/90"
                onClick={() => setShowQuickCreate(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Quick Create
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <CronjobsListTable
                  items={items ?? []}
                  selectedIds={selectedIds}
                  onSelect={toggleSelect}
                  onSelectAll={toggleSelectAll}
                  onRunNow={handleRunNow}
                  onEdit={handleEdit}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  onToggleEnabled={handleToggleEnabled}
                />
              </div>
              <div className="md:hidden">
                <CronjobsCardGrid
                  items={items ?? []}
                  selectedIds={selectedIds}
                  onSelect={toggleSelect}
                  onRunNow={handleRunNow}
                  onEdit={handleEdit}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  onToggleEnabled={handleToggleEnabled}
                />
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/[0.03] pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} · {count} total
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3" />
        <PerformancePanel />
      </div>

      <QuickCreateModal open={showQuickCreate} onOpenChange={setShowQuickCreate} />
    </AnimatedPage>
  );
}
