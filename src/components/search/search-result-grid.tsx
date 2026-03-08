/**
 * Search Result Grid: card or table view with status chips, action menus.
 * Dense rows; per-item actions: open, filter by item, export, view activity.
 * All array operations guarded (results ?? []).
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  ExternalLink,
  Filter,
  Download,
  History,
  FileText,
  FolderKanban,
  Clock,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSearchContext } from "@/contexts/search-context";
import type { SearchResult, SearchViewMode } from "@/types/search";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  content: FileText,
  project: FolderKanban,
  cronjob: Clock,
  run: Play,
};

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { dateStyle: "short" });
  } catch {
    return s;
  }
}

export interface SearchResultGridProps {
  viewMode?: SearchViewMode;
  className?: string;
  /** Override results (e.g. from props); defaults to context results */
  results?: SearchResult[];
}

export function SearchResultGrid({
  viewMode = "list",
  className,
  results: resultsOverride,
}: SearchResultGridProps) {
  const { results: contextResults, setActiveFacets } = useSearchContext();
  const results = useMemo(() => {
    if (resultsOverride !== undefined) return Array.isArray(resultsOverride) ? resultsOverride : [];
    return Array.isArray(contextResults) ? contextResults : [];
  }, [resultsOverride, contextResults]);
  const navigate = useNavigate();

  const handleOpen = (r: SearchResult) => {
    const url = r.url ?? `#`;
    if (url.startsWith("/")) navigate(url);
    else window.open(url, "_blank");
  };

  const handleFilterBy = (r: SearchResult) => {
    setActiveFacets((prev) => ({
      ...prev,
      type: r.type,
      ...(r.status ? { status: r.status } : {}),
    }));
  };

  if (results.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-card py-16 px-4",
          className
        )}
      >
        <FileText className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
        <p className="text-sm font-medium text-foreground">No results</p>
        <p className="text-xs text-muted-foreground mt-1">Try a different query or adjust filters.</p>
      </div>
    );
  }

  if (viewMode === "card") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {(results as SearchResult[]).map((r) => (
          <ResultCard key={r.id} result={r} onOpen={handleOpen} onFilterBy={handleFilterBy} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-white/[0.03] bg-card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid" aria-label="Search results">
          <thead>
            <tr className="border-b border-white/[0.03] bg-secondary/50">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Title</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Type</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Owner</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Updated</th>
              <th className="w-10 px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {(results as SearchResult[]).map((r) => (
              <ResultRow key={r.id} result={r} onOpen={handleOpen} onFilterBy={handleFilterBy} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultRow({
  result,
  onOpen,
  onFilterBy,
}: {
  result: SearchResult;
  onOpen: (r: SearchResult) => void;
  onFilterBy: (r: SearchResult) => void;
}) {
  const Icon = TYPE_ICONS[result.type] ?? FileText;
  return (
    <tr className="border-b border-white/[0.03] hover:bg-secondary/30 transition-colors">
      <td className="px-4 py-3">
        <button
          type="button"
          className="text-left font-medium text-foreground hover:text-primary truncate max-w-[200px] block"
          onClick={() => onOpen(result)}
        >
          {result.title}
        </button>
        {result.snippet && (
          <p className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5">{result.snippet}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {result.type}
        </span>
      </td>
      <td className="px-4 py-3">
        {result.status ? (
          <Badge variant="secondary" className="text-xs font-normal">
            {result.status}
          </Badge>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{result.owner ?? "—"}</td>
      <td className="px-4 py-3 text-muted-foreground tabular-nums">{formatDate(result.lastUpdated)}</td>
      <td className="px-4 py-3">
        <ResultActions result={result} onOpen={onOpen} onFilterBy={onFilterBy} />
      </td>
    </tr>
  );
}

function ResultCard({
  result,
  onOpen,
  onFilterBy,
}: {
  result: SearchResult;
  onOpen: (r: SearchResult) => void;
  onFilterBy: (r: SearchResult) => void;
}) {
  const Icon = TYPE_ICONS[result.type] ?? FileText;
  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              className="text-left font-medium text-foreground hover:text-primary truncate block w-full"
              onClick={() => onOpen(result)}
            >
              {result.title}
            </button>
            {result.snippet && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{result.snippet}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="h-3 w-3" aria-hidden />
                {result.type}
              </span>
              {result.status && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {result.status}
                </Badge>
              )}
              {result.owner && (
                <span className="text-xs text-muted-foreground">{result.owner}</span>
              )}
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatDate(result.lastUpdated)}
              </span>
            </div>
          </div>
          <ResultActions result={result} onOpen={onOpen} onFilterBy={onFilterBy} />
        </div>
      </CardContent>
    </Card>
  );
}

function ResultActions({
  result,
  onOpen,
  onFilterBy,
}: {
  result: SearchResult;
  onOpen: (r: SearchResult) => void;
  onFilterBy: (r: SearchResult) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Open actions">
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onOpen(result)}>
          <ExternalLink className="h-4 w-4 mr-2" aria-hidden />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterBy(result)}>
          <Filter className="h-4 w-4 mr-2" aria-hidden />
          Filter by this
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <Download className="h-4 w-4 mr-2" aria-hidden />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <History className="h-4 w-4 mr-2" aria-hidden />
          View activity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
