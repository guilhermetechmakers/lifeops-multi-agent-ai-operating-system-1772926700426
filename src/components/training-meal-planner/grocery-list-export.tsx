/**
 * Grocery List — Aggregated items with CSV/JSON/Clipboard export.
 * Check-off items, export formats.
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
import { ShoppingCart, Download, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlanGroceryItem } from "@/types/training-meals";

export interface GroceryListExportProps {
  groceries?: PlanGroceryItem[];
  onToggleCheck?: (id: string, checked: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

function toCSV(items: PlanGroceryItem[]): string {
  const rows = [["Name", "Quantity", "Unit", "Notes"]];
  (items ?? []).forEach((g) => {
    rows.push([
      g.name ?? "",
      String(g.quantity ?? ""),
      g.unit ?? "",
      g.notes ?? "",
    ]);
  });
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function toJSON(items: PlanGroceryItem[]): string {
  return JSON.stringify(
    (items ?? []).map((g) => ({
      name: g.name,
      quantity: g.quantity,
      unit: g.unit,
      notes: g.notes,
    })),
    null,
    2
  );
}

export function GroceryListExport({
  groceries = [],
  onToggleCheck,
  isLoading = false,
  className,
}: GroceryListExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const safeGroceries = Array.isArray(groceries) ? groceries : [];

  const handleExport = useCallback(
    async (format: "csv" | "json" | "clipboard") => {
      if (safeGroceries.length === 0) {
        toast.error("No items to export");
        return;
      }
      setIsExporting(true);
      try {
        const csv = toCSV(safeGroceries);
        const json = toJSON(safeGroceries);

        if (format === "clipboard") {
          await navigator.clipboard.writeText(csv);
          toast.success("Copied to clipboard");
          return;
        }

        if (format === "csv") {
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "grocery-list.csv";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Exported as CSV");
        } else {
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "grocery-list.json";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Exported as JSON");
        }
      } catch {
        toast.error("Export failed");
      } finally {
        setIsExporting(false);
      }
    },
    [safeGroceries]
  );

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
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={isExporting || safeGroceries.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              Download CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              Download JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("clipboard")}>
              <Copy className="mr-2 h-3 w-3" />
              Copy to clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-secondary/50" aria-hidden />
            ))}
          </div>
        ) : safeGroceries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No items yet</p>
            <p className="text-xs text-muted-foreground">
              Generate a plan to create your grocery list
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {safeGroceries.map((g) => (
              <li
                key={g.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-white/[0.03] px-3 py-2 transition-colors duration-200",
                  g.checked && "opacity-60"
                )}
              >
                <Checkbox
                  checked={g.checked ?? false}
                  onCheckedChange={(checked) =>
                    onToggleCheck?.(g.id, checked === true)
                  }
                  aria-label={`Toggle ${g.name}`}
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    g.checked ? "text-muted-foreground line-through" : "text-foreground"
                  )}
                >
                  {g.name ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {g.quantity} {g.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
