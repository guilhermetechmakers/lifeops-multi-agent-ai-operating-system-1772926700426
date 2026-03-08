import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchResult {
  id: string;
  title: string;
  section?: string;
  href?: string;
  path?: string;
  snippet?: string;
  description?: string;
  type?: string;
}

interface DocsSearchIndexProps {
  searchResults?: SearchResult[];
  onSearch?: (query: string) => SearchResult[];
  className?: string;
  /** Controlled mode: pass results from parent (e.g. layout) */
  results?: SearchResult[];
  onSelect?: () => void;
}

function debounce(fn: (q: string) => void, ms: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (q: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(q), ms);
  };
}

const defaultIndex: SearchResult[] = [
  { id: "1", title: "List Cronjobs", section: "API Reference", href: "/docs/api#list-cronjobs", snippet: "GET /api/v1/cronjobs" },
  { id: "2", title: "GitHub Connector", section: "Connectors", href: "/docs/connectors#github", snippet: "OAuth setup for GitHub" },
  { id: "3", title: "PR Triage Agent", section: "Agent Templates", href: "/docs/templates#pr-triage", snippet: "Analyzes pull requests" },
  { id: "4", title: "Cronjob Schema", section: "Workflow Schema", href: "/docs/workflow-schema#cronjob", snippet: "Cronjob object model" },
];

export function DocsSearchIndex({
  searchResults = [],
  onSearch,
  className,
  results: controlledResults,
  onSelect: onSelectCallback,
}: DocsSearchIndexProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const isControlled = controlledResults !== undefined;
  const displayResults = isControlled ? (controlledResults ?? []) : results;
  const showResults = isControlled ? (controlledResults?.length ?? 0) > 0 : isOpen && (results?.length ?? 0) > 0;

  const searchFn = useCallback(
    (q: string) => {
      const trimmed = (q ?? "").trim().toLowerCase();
      if (!trimmed) {
        setResults([]);
        return;
      }
      if (onSearch) {
        setResults(onSearch(trimmed));
        return;
      }
      const index = searchResults?.length ? searchResults : defaultIndex;
      const filtered = (index ?? []).filter(
        (r) =>
          (r?.title ?? "").toLowerCase().includes(trimmed) ||
          (r?.section ?? "").toLowerCase().includes(trimmed) ||
          (r?.snippet ?? "").toLowerCase().includes(trimmed)
      );
      setResults(filtered);
    },
    [onSearch, searchResults]
  );

  const debouncedSearch = useMemo(
    () => debounce(searchFn, 200),
    [searchFn]
  );

  const handleChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
    setIsOpen(true);
  };

  const handleSelect = (hrefOrPath: string) => {
    if (hrefOrPath) navigate(hrefOrPath);
    setIsOpen(false);
    setQuery("");
    setResults([]);
    onSelectCallback?.();
  };

  const resultsList = Array.isArray(displayResults) ? displayResults : [];

  if (isControlled) {
    return (
      <ul
        id="docs-search-results"
        role="listbox"
        className={cn(
          "max-h-64 overflow-y-auto rounded-lg border border-white/[0.03] bg-card shadow-lg",
          className
        )}
      >
        {resultsList.map((r) => (
          <li
            key={r?.id ?? ""}
            role="option"
            tabIndex={0}
            onMouseDown={() => handleSelect(r?.href ?? r?.path ?? "")}
            className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-white/[0.03] last:border-0"
          >
            <div className="font-medium text-foreground">{r?.title ?? ""}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {r?.section ?? r?.type ?? ""}
              {(r?.snippet ?? r?.description) && ` · ${r?.snippet ?? r?.description ?? ""}`}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search docs..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="pl-9 w-full"
          aria-label="Search documentation"
          aria-expanded={showResults}
          aria-controls="docs-search-results"
        />
      </div>
      {showResults && (
        <ul
          id="docs-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-white/[0.03] bg-card shadow-lg z-50"
        >
          {resultsList.map((r) => (
            <li
              key={r?.id ?? ""}
              role="option"
              tabIndex={0}
              onMouseDown={() => handleSelect(r?.href ?? r?.path ?? "")}
              className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-white/[0.03] last:border-0"
            >
              <div className="font-medium text-foreground">{r?.title ?? ""}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {r?.section ?? r?.type ?? ""}
                {(r?.snippet ?? r?.description) && ` · ${r?.snippet ?? r?.description ?? ""}`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
