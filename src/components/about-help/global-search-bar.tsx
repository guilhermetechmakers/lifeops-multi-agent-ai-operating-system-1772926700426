/**
 * GlobalSearchBar — Quick site search across docs and FAQs with live results dropdown.
 * Data: results from searchDocsAndFaqs(docs, faqs). Guarded arrays.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc, FAQ, SearchResult } from "@/types/about-help";
import { searchDocsAndFaqs } from "@/api/about-help";

interface GlobalSearchBarProps {
  docs?: Doc[] | null;
  faqs?: FAQ[] | null;
  className?: string;
}

export function GlobalSearchBar({ docs, faqs, className }: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const docsList = Array.isArray(docs) ? docs : (docs ?? []);
  const faqsList = Array.isArray(faqs) ? faqs : (faqs ?? []);

  const updateResults = useCallback(() => {
    const list = searchDocsAndFaqs(query, docsList, faqsList);
    setResults(list);
    setActiveIndex(-1);
    setOpen(list.length > 0);
  }, [query, docsList, faqsList]);

  useEffect(() => {
    const t = setTimeout(updateResults, 150);
    return () => clearTimeout(t);
  }, [updateResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      const r = results[activeIndex];
      if (r.url.startsWith("/")) navigate(r.url);
      else window.open(r.url, "_blank");
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectResult = (r: SearchResult) => {
    if (r.url.startsWith("/")) navigate(r.url);
    else window.open(r.url, "_blank");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search docs &amp; FAQ…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9"
          aria-label="Global search"
          aria-expanded={open}
          aria-controls="global-search-results"
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `result-${results[activeIndex].id}`
              : undefined
          }
        />
      </div>
      {open && results.length > 0 ? (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute top-full z-50 mt-1 w-full rounded-lg border border-white/[0.03] bg-card py-2 shadow-lg"
        >
          <ScrollArea className="max-h-[280px]">
            {(results ?? []).map((r, i) => (
              <button
                key={r.id}
                id={`result-${r.id}`}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors",
                  i === activeIndex ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
                onClick={() => selectResult(r)}
              >
                {r.type === "doc" ? (
                  <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">{r.title}</div>
                  {r.snippet ? (
                    <div className="text-xs text-muted-foreground truncate">
                      {r.snippet}
                    </div>
                  ) : null}
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
