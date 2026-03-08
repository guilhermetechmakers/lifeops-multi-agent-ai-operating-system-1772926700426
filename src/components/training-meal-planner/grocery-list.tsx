/**
 * Grocery List — Aggregated items from meal plans.
 * Export CSV/JSON, copy to clipboard, check-off items.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Download, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlanGroceryItem } from "@/types/training-plan";

export interface GroceryListProps {
  items?: PlanGroceryItem[] | null;
  onToggleCheck?: (name: string, checked: boolean) => void;
  onExport?: () => void;
  isLoading?: boolean;
  className?: string;
}

function toGroceryWithId(items: PlanGroceryItem[]): Array<PlanGroceryItem & { id: string }> {
  return (items ?? []).map((item, i) => ({
    ...item,
    id: `g-${i}-${item.name}`,
  }));
}

export function GroceryList({
  items = [],
  onToggleCheck,
  onExport,
  isLoading,
  className,
}: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];
  const itemsWithId = toGroceryWithId(safeItems);

  const handleToggle = useCallback(
    (name: string, checked: boolean) => {
      setCheckedItems((prev) => {
        const next = new Set(prev);
        if (checked) next.add(name);
        else next.delete(name);
        return next;
      });
      onToggleCheck?.(name, checked);
    },
    [onToggleCheck]
  );

  const exportCsv = useCallback(() => {
    const rows = safeItems.map((i) => [i.name, i.quantity, i.unit].join(","));
    return "name,quantity,unit\n" + rows.join("\n");
  }, [safeItems]);

  const exportJson = useCallback(() => {
    return JSON.stringify(safeItems, null, 2);
  }, [safeItems]);

  const handleExport = useCallback(
    async (format: "csv" | "json" | "clipboard") => {
      setIsExporting(true);
      try {
        if (format === "csv") {
          const csv = exportCsv();
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "grocery-list.csv";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Exported as CSV");
        } else if (format === "json") {
          const json = exportJson();
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "grocery-list.json";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Exported as JSON");
        } else {
          const csv = exportCsv();
          await navigator.clipboard.writeText(csv);
          toast.success("Copied to clipboard");
        }
        onExport?.();
      } catch {
        toast.error("Export failed");
      } finally {
        setIsExporting(false);
      }
    },
    [exportCsv, exportJson, onExport]
  );

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-32 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" aria-hidden />
          Grocery list
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={isExporting || safeItems.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : (
                <Download className="h-3 w-3" aria-hidden />
              )}
              Export
              <ChevronDown className="h-3 w-3" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("clipboard")}>
              Copy to clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {safeItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No items yet</p>
            <p className="text-xs text-muted-foreground">
              Generate from your meal plan
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {itemsWithId.map((item) => {
              const isChecked = checkedItems.has(item.name);
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-white/[0.03] px-3 py-2 transition-colors",
                    isChecked && "opacity-60"
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleToggle(item.name, checked === true)
                    }
                    aria-label={`Toggle ${item.name}`}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      isChecked ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {item.name ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
