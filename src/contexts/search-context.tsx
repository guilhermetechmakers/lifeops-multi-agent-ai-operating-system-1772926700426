/**
 * Search & Filter context: query, scope, module, facets, results, pagination.
 * Syncs with URL query params for shareable links. All array/object access guarded.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  SearchScope,
  SearchModule,
  SearchResult,
  FacetMeta,
  GlobalSearchResponse,
  ActiveFacets,
} from "@/types/search";

export type { ActiveFacets } from "@/types/search";

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  scope: SearchScope;
  setScope: (s: SearchScope) => void;
  module: SearchModule | undefined;
  setModule: (m: SearchModule | undefined) => void;
  activeFacets: ActiveFacets;
  setActiveFacets: (f: ActiveFacets | ((prev: ActiveFacets) => ActiveFacets)) => void;
  results: SearchResult[];
  total: number;
  loading: boolean;
  error: string | null;
  runSearch: (opts?: { page?: number; pageSize?: number }) => void;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (p: number) => void;
  facets: FacetMeta[];
  savedQueryId: string | null;
  setSavedQueryId: (id: string | null) => void;
  lastResponse: GlobalSearchResponse | null;
  /** Run a saved query by id and set results in context */
  runSavedQuery: (id: string, opts?: { page?: number; pageSize?: number }) => Promise<void>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

const DEFAULT_PAGE_SIZE = 20;

export function SearchProvider({
  children,
  initialScope = "global",
  initialModule,
}: {
  children: ReactNode;
  initialScope?: SearchScope;
  initialModule?: SearchModule;
}) {
  const [query, setQueryState] = useState("");
  const [scope, setScopeState] = useState<SearchScope>(initialScope);
  const [module, setModuleState] = useState<SearchModule | undefined>(initialModule);
  const [activeFacets, setActiveFacets] = useState<ActiveFacets>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);
  const [facets, setFacets] = useState<FacetMeta[]>([]);
  const [savedQueryId, setSavedQueryId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<GlobalSearchResponse | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryState(q ?? "");
  }, []);

  const setScope = useCallback((s: SearchScope) => {
    setScopeState(s);
  }, []);

  const setModule = useCallback((m: SearchModule | undefined) => {
    setModuleState(m);
  }, []);

  const setPageSize = useCallback((p: number) => {
    setPageSizeState(Math.max(1, Math.min(100, p)));
    setPage(1);
  }, []);

  const runSearch = useCallback(
    async (opts?: { page?: number; pageSize?: number }) => {
      setError(null);
      setLoading(true);
      const p = opts?.page ?? page;
      const ps = opts?.pageSize ?? pageSize;
      try {
        const { searchApi, searchMock } = await import("@/api/search");
        const USE_MOCK =
          !import.meta.env.VITE_API_URL ||
          import.meta.env.VITE_USE_MOCK_SEARCH === "true";
        const body = {
          query,
          scope,
          module,
          facets: Object.keys(activeFacets).length > 0 ? activeFacets : undefined,
          page: p,
          pageSize: ps,
        };
        const response: GlobalSearchResponse = USE_MOCK
          ? await searchMock.global(body)
          : await searchApi.global(body);
        const res = response?.results ?? [];
        const tot = typeof response?.total === "number" ? response.total : 0;
        const fac = Array.isArray(response?.facets) ? response.facets : [];
        setResults(res);
        setTotal(tot);
        setFacets(fac);
        setLastResponse(response);
        if (opts?.page != null) setPage(opts.page);
        if (opts?.pageSize != null) setPageSize(opts.pageSize);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        setError(msg);
        setResults([]);
        setTotal(0);
        setFacets([]);
      } finally {
        setLoading(false);
      }
    },
    [query, scope, module, activeFacets, page, pageSize]
  );

  const runSavedQuery = useCallback(
    async (id: string, opts?: { page?: number; pageSize?: number }) => {
      setError(null);
      setLoading(true);
      setSavedQueryId(id);
      try {
        const { searchApi, searchMock } = await import("@/api/search");
        const USE_MOCK =
          !import.meta.env.VITE_API_URL ||
          import.meta.env.VITE_USE_MOCK_SEARCH === "true";
        const response: GlobalSearchResponse = USE_MOCK
          ? await searchMock.runSavedQuery(id)
          : await searchApi.runSavedQuery(id, opts);
        const res = response?.results ?? [];
        const tot = typeof response?.total === "number" ? response.total : 0;
        const fac = Array.isArray(response?.facets) ? response.facets : [];
        setResults(res);
        setTotal(tot);
        setFacets(fac);
        setLastResponse(response);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Saved query failed";
        setError(msg);
        setResults([]);
        setTotal(0);
        setFacets([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      setQuery,
      scope,
      setScope,
      module,
      setModule,
      activeFacets,
      setActiveFacets,
      results,
      total,
      loading,
      error,
      runSearch,
      page,
      pageSize,
      setPage,
      setPageSize,
      facets,
      savedQueryId,
      setSavedQueryId,
      lastResponse,
      runSavedQuery,
    }),
    [
      query,
      setQuery,
      scope,
      setScope,
      module,
      setModule,
      activeFacets,
      results,
      total,
      loading,
      error,
      runSearch,
      page,
      pageSize,
      setPageSize,
      facets,
      savedQueryId,
      lastResponse,
      runSavedQuery,
    ]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    return {
      query: "",
      setQuery: () => {},
      scope: "global",
      setScope: () => {},
      module: undefined,
      setModule: () => {},
      activeFacets: {},
      setActiveFacets: () => {},
      results: [],
      total: 0,
      loading: false,
      error: null,
      runSearch: () => {},
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      setPage: () => {},
      setPageSize: () => {},
      facets: [],
      savedQueryId: null,
      setSavedQueryId: () => {},
      lastResponse: null,
      runSavedQuery: async () => {},
    };
  }
  return ctx;
}
