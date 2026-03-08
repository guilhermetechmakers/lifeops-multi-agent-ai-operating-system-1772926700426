/**
 * Faceted Search Panel: left-side facets with counts, multi-select, range sliders.
 * Apply/Clear buttons; real-time facet counts. Accessible and keyboard-friendly.
 */

import { useMemo, useCallback } from "react";
import { RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSearchContext } from "@/contexts/search-context";
import type { FacetMeta, FacetOption, ActiveFacets } from "@/types/search";

export interface FacetedSearchPanelProps {
  /** Optional class for the panel container */
  className?: string;
  /** Max height for scroll area */
  maxHeight?: string;
}

export function FacetedSearchPanel({ className, maxHeight = "calc(100vh - 200px)" }: FacetedSearchPanelProps) {
  const { facets, activeFacets, setActiveFacets, runSearch } = useSearchContext();
  const safeFacets = Array.isArray(facets) ? facets : [];

  const handleMultiChange = useCallback(
    (field: string, value: string, checked: boolean) => {
      setActiveFacets((prev) => {
        const current = prev[field];
        const arr: string[] = Array.isArray(current)
          ? (current as string[]).slice()
          : typeof current === "string"
            ? [current]
            : [];
        const next: string[] = checked ? (arr.includes(value) ? arr : [...arr, value]) : arr.filter((v) => v !== value);
        return { ...prev, [field]: next.length > 0 ? next : undefined };
      });
    },
    [setActiveFacets]
  );

  const handleRangeChange = useCallback(
    (field: string, min: number, max: number) => {
      setActiveFacets((prev) => ({
        ...prev,
        [field]: [min, max] as [number, number],
      }));
    },
    [setActiveFacets]
  );

  const handleClear = useCallback(() => {
    setActiveFacets({});
  }, [setActiveFacets]);

  const handleApply = useCallback(() => {
    runSearch({ page: 1 });
  }, [runSearch]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(activeFacets ?? {}).some((k) => {
      const v = activeFacets[k];
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "number") return true;
      if (Array.isArray(v) && v.length === 2) return true;
      return v != null && v !== "";
    });
  }, [activeFacets]);

  if (safeFacets.length === 0) {
    return (
      <div className={cn("rounded-lg border border-white/[0.03] bg-card p-4", className)}>
        <p className="text-sm text-muted-foreground">No filters available. Run a search to see facets.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-white/[0.03] bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.03]">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          Filters
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={handleClear} aria-label="Clear all filters">
            <RotateCcw className="h-3.5 w-3.5 mr-1" aria-hidden />
            Clear
          </Button>
        )}
      </div>
      <ScrollArea style={{ maxHeight }} className="p-2">
        <div className="space-y-4 py-2">
          {safeFacets.map((facet) => (
            <FacetBlock
              key={facet.field}
              facet={facet}
              activeFacets={activeFacets}
              onMultiChange={handleMultiChange}
              onRangeChange={handleRangeChange}
            />
          ))}
        </div>
      </ScrollArea>
      {hasActiveFilters && (
        <div className="p-3 border-t border-white/[0.03]">
          <Button size="sm" className="w-full h-9" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      )}
    </div>
  );
}

function FacetBlock({
  facet,
  activeFacets,
  onMultiChange,
  onRangeChange,
}: {
  facet: FacetMeta;
  activeFacets: ActiveFacets;
  onMultiChange: (field: string, value: string, checked: boolean) => void;
  onRangeChange: (field: string, min: number, max: number) => void;
}) {
  const selected = activeFacets[facet.field];
  const selectedSet = useMemo(() => {
    if (Array.isArray(selected)) return new Set(selected as string[]);
    if (typeof selected === "string") return new Set([selected]);
    return new Set<string>();
  }, [selected]);

  if (facet.type === "range" && facet.min != null && facet.max != null) {
    const rangeVal = selected as [number, number] | undefined;
    const low = Array.isArray(rangeVal) ? rangeVal[0] : facet.min;
    const high = Array.isArray(rangeVal) ? rangeVal[1] : facet.max;
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">{facet.label}</Label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={facet.min}
            max={facet.max}
            step={facet.step ?? 1}
            value={low}
            onChange={(e) => onRangeChange(facet.field, Number(e.target.value), high)}
            className="h-8 w-20 rounded border border-input bg-input px-2 text-xs text-foreground"
            aria-label={`${facet.label} min`}
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="number"
            min={facet.min}
            max={facet.max}
            step={facet.step ?? 1}
            value={high}
            onChange={(e) => onRangeChange(facet.field, low, Number(e.target.value))}
            className="h-8 w-20 rounded border border-input bg-input px-2 text-xs text-foreground"
            aria-label={`${facet.label} max`}
          />
        </div>
      </div>
    );
  }

  const options = Array.isArray(facet.options) ? facet.options : [];
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{facet.label}</Label>
      <ul className="space-y-1.5" role="group" aria-label={facet.label}>
        {options.map((opt: FacetOption) => {
          const checked = selectedSet.has(opt.value);
          return (
            <li key={opt.value}>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-foreground/90">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => onMultiChange(facet.field, opt.value, c === true)}
                  aria-label={`${opt.label} (${opt.count})`}
                />
                <span className="flex-1 truncate">{opt.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{opt.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
