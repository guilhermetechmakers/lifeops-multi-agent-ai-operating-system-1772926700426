/**
 * Global / Module Search Bar with autocomplete, scope toggle, and hotkey (/).
 * Accessible keyboard nav (Arrow Up/Down, Enter, Esc). Debounced autocomplete (300ms).
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { Search, Globe, FolderKanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchContext } from "@/contexts/search-context";
import { useSearchAutocomplete } from "@/hooks/use-search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SearchModule } from "@/types/search";

const MODULE_OPTIONS: { value: SearchModule; label: string }[] = [
  { value: "content", label: "Content" },
  { value: "projects", label: "Projects" },
  { value: "cronjobs", label: "Cronjobs" },
  { value: "runs", label: "Runs" },
  { value: "users", label: "Users" },
];

export interface GlobalSearchBarProps {
  /** When true, show scope/module toggle (global vs module) */
  showScopeToggle?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Optional fixed module (e.g. when on content dashboard) */
  fixedModule?: SearchModule;
  /** className for the wrapper */
  className?: string;
  /** Callback when user submits (e.g. navigate to search page) */
  onSubmit?: () => void;
}

export function GlobalSearchBar({
  showScopeToggle = true,
  placeholder = "Search projects, content, cronjobs, runs...",
  fixedModule,
  className,
  onSubmit,
}: GlobalSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const {
    query,
    setQuery,
    scope,
    setScope,
    module,
    setModule,
    runSearch,
  } = useSearchContext();
  const debouncedQuery = useDebouncedValue(query, 300);
  const { suggestions, isLoading } = useSearchAutocomplete(
    debouncedQuery,
    scope,
    fixedModule ?? module,
    true
  );
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "Escape") (e.target as HTMLInputElement).blur();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, safeSuggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter" && highlightIndex >= 0 && safeSuggestions[highlightIndex]) {
        e.preventDefault();
        setQuery(safeSuggestions[highlightIndex] ?? "");
        setHighlightIndex(-1);
        setOpen(false);
        runSearch();
        onSubmit?.();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        setHighlightIndex(-1);
      }
    },
    [open, highlightIndex, safeSuggestions, setQuery, runSearch, onSubmit]
  );

  useEffect(() => {
    setOpen(debouncedQuery.length >= 2 && safeSuggestions.length > 0);
    setHighlightIndex(-1);
  }, [debouncedQuery, safeSuggestions.length]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (s: string) => {
    setQuery(s);
    setOpen(false);
    setHighlightIndex(-1);
    runSearch();
    onSubmit?.();
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => debouncedQuery.length >= 2 && safeSuggestions.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-9 pr-4 h-10 rounded-md border border-white/[0.03] bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search"
            aria-expanded={open}
            aria-controls="search-suggestions"
            aria-activedescendant={highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined}
          />
          {open && (
            <div
              id="search-suggestions"
              ref={listRef}
              role="listbox"
              className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-white/[0.03] bg-card shadow-lg py-1 animate-in fade-in-0 slide-in-from-top-1 duration-200"
            >
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">Loading...</div>
              ) : safeSuggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">No suggestions</div>
              ) : (
                (safeSuggestions as string[]).map((s, i) => (
                  <button
                    key={`${s}-${i}`}
                    id={`suggestion-${i}`}
                    role="option"
                    aria-selected={i === highlightIndex}
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm transition-colors",
                      i === highlightIndex ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                    onMouseEnter={() => setHighlightIndex(i)}
                    onClick={() => handleSelect(s)}
                  >
                    {s}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {showScopeToggle && !fixedModule && (
          <div className="flex rounded-md border border-white/[0.03] bg-secondary overflow-hidden shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none h-10 px-3",
                scope === "global" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setScope("global")}
              aria-pressed={scope === "global"}
              aria-label="Search globally"
            >
              <Globe className="h-4 w-4 mr-1" aria-hidden />
              <span className="hidden sm:inline">Global</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none h-10 px-3",
                scope === "module" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setScope("module")}
              aria-pressed={scope === "module"}
              aria-label="Search in module"
            >
              <FolderKanban className="h-4 w-4 mr-1" aria-hidden />
              <span className="hidden sm:inline">Module</span>
            </Button>
          </div>
        )}
      </div>
      {showScopeToggle && scope === "module" && !fixedModule && (
        <div className="flex flex-wrap gap-1 mt-2">
          {MODULE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                module === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              onClick={() => setModule(opt.value)}
              aria-pressed={module === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
