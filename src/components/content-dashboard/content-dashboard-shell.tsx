/**
 * ContentDashboardShell — layout with Sidebar, TopNav, responsive Grid of panels.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { GlobalSearchBar, type SearchScope } from "./global-search-bar";
import { ModuleFiltersBar, type ContentFiltersState } from "./module-filters-bar";
import { ContentCalendarPanel } from "./content-calendar-panel";
import { PipelineSummaryCard } from "./pipeline-summary-card";
import { DraftsPanel } from "./drafts-panel";
import { PublishingQueuePanel } from "./publishing-queue-panel";
import { ApprovalsQueuePanel } from "./approvals-queue-panel";
import { AgentRecommendationsPanel } from "./agent-recommendations-panel";
import { SEOPerformancePanel } from "./seo-performance-panel";
import { ContentEditorShortcutHub } from "./content-editor-shortcut-hub";
import { DataVizDrawer } from "./data-viz-drawer";
import { AuditTrailPanel } from "./audit-trail-panel";
import { useContentItems } from "@/hooks/use-content-dashboard";
import { useProjectsList } from "@/hooks/use-projects";
import type { ContentItem } from "@/types/content-dashboard";

export function ContentDashboardShell() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [filters, setFilters] = useState<ContentFiltersState>({});
  const selectedRunId: string | null = null;

  const { items: projects } = useProjectsList();
  const projectList = Array.isArray(projects) ? projects : [];

  const { data: contentData } = useContentItems({
    filters,
    search: search || undefined,
  });
  const rawItems = contentData?.items ?? [];
  const recentItems = Array.isArray(rawItems) ? rawItems.slice(0, 5) : [];

  const handleOpenEditor = useCallback(
    (item?: ContentItem) => {
      const path = item
        ? `/dashboard/content/editor?itemId=${item.id}`
        : "/dashboard/content/editor";
      navigate(path);
    },
    [navigate]
  );

  const handleUseIdea = useCallback(
    (topic: string, _rationale: string) => {
      navigate(`/dashboard/content/editor?template=idea&topic=${encodeURIComponent(topic)}`);
    },
    [navigate]
  );

  return (
    <AnimatedPage className="flex flex-col gap-6">
      <header className="flex flex-col gap-1" style={{ minHeight: "56px" }}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Content Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Content pipelines, calendar, drafts, publishing queue, SEO insights
        </p>
      </header>

      {/* Global search + filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-xl">
          <GlobalSearchBar
            value={search}
            onChange={setSearch}
            scope={scope}
            onScopeChange={setScope}
          />
        </div>
        <ModuleFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          projects={projectList.map((p: { id: string; name: string }) => ({
            id: p.id,
            name: p.name,
          }))}
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Pipelines + Calendar + Drafts */}
        <div className="lg:col-span-2 space-y-6">
          <PipelineSummaryCard />
          <ContentCalendarPanel
            filters={{
              statuses: filters.statuses,
              projectIds: filters.projectIds,
            }}
          />
          <DraftsPanel
            filters={{
              statuses: filters.statuses,
              projectIds: filters.projectIds,
            }}
            onOpenEditor={handleOpenEditor}
          />
          <PublishingQueuePanel />
        </div>

        {/* Right: Panels */}
        <div className="space-y-6">
          <ApprovalsQueuePanel />
          <ContentEditorShortcutHub recentItems={recentItems} />
          <AgentRecommendationsPanel onUseIdea={handleUseIdea} />
          <SEOPerformancePanel
            onOpenEditor={(contentItemId) =>
              navigate(`/dashboard/content/editor?itemId=${contentItemId}`)
            }
          />
          <DataVizDrawer />
          <AuditTrailPanel
            runId={selectedRunId}
            runArtifact={null}
            isLoading={false}
          />
        </div>
      </div>
    </AnimatedPage>
  );
}
