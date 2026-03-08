/**
 * Search page: full faceted search with results grid and pagination.
 * Integrates GlobalSearchBar, FacetedSearchPanel, SavedQueriesPanel, ResultGrid, Pagination.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, LayoutGrid, List } from "lucide-react";
import { SearchProvider, useSearchContext } from "@/contexts/search-context";
import { AnimatedPage } from "@/components/animated-page";
import {
  GlobalSearchBar,
  FacetedSearchPanel,
  SavedQueriesPanel,
  SearchResultGrid,
  SearchPagination,
} from "@/components/search";
import { Button } from "@/components/ui/button";
import type { SearchViewMode } from "@/types/search";

const MODULE_FROM_PARAM: Record<string, "content" | "cronjobs" | "projects" | "runs" | "users"> = {
  content: "content",
  cronjobs: "cronjobs",
  projects: "projects",
  runs: "runs",
  users: "users",
};

function SearchPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<SearchViewMode>("list");
  const {
    query,
    setQuery,
    scope,
    setScope,
    module,
    setModule,
    runSearch,
    total,
    loading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useSearchContext();

  useEffect(() => {
    const q = searchParams.get("q");
    const scopeParam = searchParams.get("scope");
    const moduleParam = searchParams.get("module");
    if (q != null) setQuery(q);
    if (scopeParam === "global" || scopeParam === "module") setScope(scopeParam);
    if (moduleParam && MODULE_FROM_PARAM[moduleParam]) setModule(MODULE_FROM_PARAM[moduleParam]);
  }, [searchParams, setQuery, setScope, setModule]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query);
    else params.delete("q");
    params.set("scope", scope);
    if (module) params.set("module", module);
    else params.delete("module");
    setSearchParams(params, { replace: true });
  }, [query, scope, module, setSearchParams]);

  const handleSearch = () => runSearch({ page: 1 });

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Search</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <GlobalSearchBar
              showScopeToggle
              placeholder="Search projects, content, cronjobs, runs..."
              onSubmit={handleSearch}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="shrink-0 h-10">
            <Search className="h-4 w-4 mr-2" aria-hidden />
            Search
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <FacetedSearchPanel maxHeight="400px" />
            <SavedQueriesPanel showCreate compact />
          </aside>
          <main className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? "Searching..." : `${total} result${total === 1 ? "" : "s"}`}
              </p>
              <div className="flex items-center gap-1 rounded-md border border-white/[0.03] bg-secondary p-0.5">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  variant={viewMode === "card" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setViewMode("card")}
                  aria-pressed={viewMode === "card"}
                  aria-label="Card view"
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-lg border border-white/[0.03] bg-card p-12 text-center">
                <div className="animate-pulse text-muted-foreground text-sm">Loading results...</div>
              </div>
            ) : (
              <>
                <SearchResultGrid viewMode={viewMode} />
                <SearchPagination
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  onPageChange={(p) => {
                    setPage(p);
                    runSearch({ page: p });
                  }}
                  onPageSizeChange={(ps) => {
                    setPageSize(ps);
                    runSearch({ page: 1, pageSize: ps });
                  }}
                  loading={loading}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default function SearchPage() {
  return (
    <SearchProvider>
      <SearchPageContent />
    </SearchProvider>
  );
}
