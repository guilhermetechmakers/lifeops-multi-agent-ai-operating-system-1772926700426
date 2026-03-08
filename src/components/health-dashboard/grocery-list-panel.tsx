/**
 * GroceryListPanel — Generated grocery list from meal plans.
 * Export, check-off items.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroceryItem } from "@/types/health";

export interface GroceryListPanelProps {
  groceries?: GroceryItem[] | null;
  onToggleCheck?: (id: string, checked: boolean) => void;
  onExport?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function GroceryListPanel({
  groceries = [],
  onToggleCheck,
  onExport,
  isLoading,
  className,
}: GroceryListPanelProps) {
  const safeGroceries = Array.isArray(groceries) ? groceries : [];

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" aria-hidden />
          Grocery list
        </CardTitle>
        {onExport && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onExport}>
            <Download className="h-3 w-3" />
            Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-secondary" aria-hidden />
            ))}
          </div>
        ) : safeGroceries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No items yet</p>
            <p className="text-xs text-muted-foreground">
              Generate from your meal plan
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {safeGroceries.map((g) => (
              <li
                key={g.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-white/[0.03] px-3 py-2 transition-colors",
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
                <span className="text-xs text-muted-foreground">{g.quantity ?? ""}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
