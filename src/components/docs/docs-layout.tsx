import { useState, useMemo, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { DocsHeader } from "./docs-header";
import { DocsSidebar } from "./docs-sidebar";
import { DocsSearchIndex } from "./docs-search-index";
import { useQuery } from "@tanstack/react-query";
import { fetchDocsApis, fetchDocsConnectors, fetchDocsTemplates } from "@/api/docs";
import { safeArray } from "@/lib/api/guards";
import type { SearchResult } from "./docs-search-index";
import type { APIDocSection, ConnectorGuide, AgentTemplate } from "@/types/docs";

const DEBOUNCE_MS = 200;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function DocsLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, DEBOUNCE_MS);

  const { data: apisData } = useQuery({ queryKey: ["docs", "apis"], queryFn: () => fetchDocsApis() });
  const { data: connectorsData } = useQuery({
    queryKey: ["docs", "connectors"],
    queryFn: () => fetchDocsConnectors(),
  });
  const { data: templatesData } = useQuery({
    queryKey: ["docs", "templates"],
    queryFn: () => fetchDocsTemplates(),
  });

  const searchResults = useMemo((): SearchResult[] => {
    const q = (debouncedQuery ?? "").trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];
    const sections = safeArray<APIDocSection>(apisData?.data);
    sections.forEach((s) => {
      if ((s?.title ?? "").toLowerCase().includes(q) || (s?.description ?? "").toLowerCase().includes(q)) {
        results.push({
          id: s?.id ?? "",
          title: s?.title ?? "",
          description: s?.description,
          path: "/docs/api",
          type: "section",
        });
      }
      (s?.endpoints ?? []).forEach((e) => {
        if (
          (e?.path ?? "").toLowerCase().includes(q) ||
          (e?.method?.toLowerCase().includes(q)) ||
          (e?.description ?? "").toLowerCase().includes(q)
        ) {
          results.push({
            id: e?.id ?? "",
            title: `${e?.method ?? ""} ${e?.path ?? ""}`,
            description: e?.description,
            path: "/docs/api",
            type: "endpoint",
          });
        }
      });
    });
    const connectors = safeArray<ConnectorGuide>(connectorsData?.data);
    connectors.forEach((c) => {
      if ((c?.title ?? "").toLowerCase().includes(q)) {
        results.push({
          id: c?.id ?? "",
          title: c?.title ?? "",
          path: `/docs/connectors/${c?.id ?? ""}`,
          type: "connector",
        });
      }
    });
    const templates = safeArray<AgentTemplate>(templatesData?.data);
    templates.forEach((t) => {
      if (
        (t?.name ?? "").toLowerCase().includes(q) ||
        (t?.description ?? "").toLowerCase().includes(q)
      ) {
        results.push({
          id: t?.id ?? "",
          title: t?.name ?? "",
          description: t?.description,
          path: "/docs/templates",
          type: "template",
        });
      }
    });
    return results.slice(0, 10);
  }, [debouncedQuery, apisData, connectorsData, templatesData]);

  const handleSearchSelect = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DocsHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => setSearchOpen(true)}
      />
      {searchOpen && debouncedQuery && (
        <div className="absolute left-1/2 top-14 z-20 w-full max-w-md -translate-x-1/2 px-4">
          <DocsSearchIndex
            results={searchResults}
            onSelect={handleSearchSelect}
          />
        </div>
      )}
      <div className="flex flex-1">
        <DocsSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
