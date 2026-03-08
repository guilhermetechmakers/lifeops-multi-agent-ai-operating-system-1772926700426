/**
 * GroceryListExport — Grocery list with export (CSV/JSON/Clipboard) and check-off.
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PlanGroceryItem } from "@/types/training-meals";

export type ExportFormat = "csv" | "json" | "clipboard";

function toCSV(items: PlanGroceryItem[]): string {
  const header = "name,quantity,unit,notes\n";
  const rows = (items ?? []).map(
    (i) =>
      `"${(i.name ?? "").replace(/"/g, '""')}",${i.quantity ?? 0},${i.unit ?? ""},"${(i.notes ?? "").replace(/"/g, '""')}"`
  );
  return header + rows.join("\n");
}

function toJSON(items: PlanGroceryItem[]): string {
  return JSON.stringify(
    (items ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      notes: i.notes,
    })),
    null,
    2
  );
}

export interface GroceryListExportProps {
  items: PlanGroceryItem[];
  onToggleCheck?: (itemId: string, checked: boolean) => void;
  onGenerate?: () => void | Promise<unknown>;
  className?: string;
}

export function GroceryListExport({
  items = [],
  onToggleCheck,
  onGenerate,
  className,
}: GroceryListExportProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (safeItems.length === 0) {
        toast.error("No items to export");
        return;
      }
      setIsExporting(true);
      try {
        if (format === "clipboard") {
          const text = toCSV(safeItems);
          await navigator.clipboard.writeText(text);
          toast.success("Copied to clipboard");
        } else if (format === "csv") {
          const blob = new Blob([toCSV(safeItems)], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "grocery-list.csv";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("CSV downloaded");
        } else if (format === "json") {
          const blob = new Blob([toJSON(safeItems)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "grocery-list.json";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("JSON downloaded");
        }
      } catch {
        toast.error("Export failed");
      } finally {
        setIsExporting(false);
      }
    },
    [safeItems]
  );

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" aria-hidden />
          Grocery list
        </CardTitle>
        <div className="flex items-center gap-2">
          {onGenerate && (
            <Button variant="outline" size="sm" onClick={onGenerate}>
              Generate list
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isExporting || safeItems.length === 0}>
                {isExporting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                <span className="ml-1">Export</span>
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
        </div>
      </CardHeader>
      <CardContent>
        {safeItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No items yet</p>
            <p className="text-xs text-muted-foreground">
              Generate a plan or aggregate from meals to build your list
            </p>
            {onGenerate && (
              <Button variant="outline" size="sm" className="mt-3" onClick={onGenerate}>
                Generate list
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {safeItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-white/[0.03] px-3 py-2 transition-colors",
                  item.checked && "opacity-60"
                )}
              >
                <Checkbox
                  checked={item.checked ?? false}
                  onCheckedChange={(checked) =>
                    onToggleCheck?.(item.id, checked === true)
                  }
                  aria-label={`Toggle ${item.name}`}
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    item.checked ? "text-muted-foreground line-through" : "text-foreground"
                  )}
                >
                  {item.name ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.quantity ?? 0} {item.unit ?? ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
