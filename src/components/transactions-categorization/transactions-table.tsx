/**
 * TransactionsTable — Sortable columns, inline category edit, selectable rows, per-row actions.
 * Runtime-safe: guards all array access with (items ?? []).
 */

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, ChevronDown, MoreHorizontal, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionEnriched } from "@/types/finance";

const CATEGORIES = [
  { id: "SaaS", name: "SaaS" },
  { id: "Income", name: "Income" },
  { id: "Other", name: "Other" },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatAmount(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}$${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type SortKey = "date" | "merchant" | "amount" | "category" | "account" | "status";
type SortDir = "asc" | "desc";

export interface TransactionsTableProps {
  transactions: TransactionEnriched[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCategorize: (id: string, category: string, subcategory?: string) => void;
  onFlagException: (id: string, reason: string, notes?: string) => void;
  onExport?: (ids: string[]) => void;
  isLoading?: boolean;
}

export function TransactionsTable({
  transactions,
  selectedIds,
  onSelectionChange,
  onCategorize,
  onFlagException,
  onExport,
  isLoading = false,
}: TransactionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editSubcategory, setEditSubcategory] = useState("");

  const items = Array.isArray(transactions) ? transactions : [];

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":
          cmp = (a.date ?? "").localeCompare(b.date ?? "");
          break;
        case "merchant":
          cmp = (a.merchant ?? "").localeCompare(b.merchant ?? "");
          break;
        case "amount":
          cmp = (a.amount ?? 0) - (b.amount ?? 0);
          break;
        case "category":
          cmp = (a.category ?? a.categorizedCategory ?? "").localeCompare(
            b.category ?? b.categorizedCategory ?? ""
          );
          break;
        case "account":
          cmp = (a.accountId ?? "").localeCompare(b.accountId ?? "");
          break;
        case "status":
          cmp = (a.status ?? "").localeCompare(b.status ?? "");
          break;
        default:
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else setSortKey(key);
    },
    [sortKey]
  );

  const SortIcon = ({ column }: { column: SortKey }) =>
    sortKey === column ? (
      sortDir === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )
    ) : null;

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === sorted.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange((sorted ?? []).map((t) => t.id));
    }
  }, [selectedIds.length, sorted, onSelectionChange]);

  const handleSelectOne = useCallback(
    (id: string) => {
      const set = new Set(selectedIds ?? []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      onSelectionChange([...set]);
    },
    [selectedIds, onSelectionChange]
  );

  const startEdit = useCallback((id: string, cat: string, sub: string) => {
    setEditingId(id);
    setEditCategory(cat ?? "");
    setEditSubcategory(sub ?? "");
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && editCategory.trim()) {
      onCategorize(editingId, editCategory.trim(), editSubcategory.trim() || undefined);
      setEditingId(null);
    }
  }, [editingId, editCategory, editSubcategory, onCategorize]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditCategory("");
    setEditSubcategory("");
  }, []);

  const getCategoryName = (t: TransactionEnriched) =>
    t.category ?? t.categorizedCategory ?? "—";

  const isManual = (t: TransactionEnriched) =>
    Boolean(t.category ?? t.categorizedCategory) && (t.confidence ?? 1) < 1;

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Transaction Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-secondary"
                aria-hidden
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Tag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground mb-1">
              No transactions match your filters
            </p>
            <p className="text-sm text-muted-foreground">
              Adjust filters or run ingestion to load transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full border-collapse" role="table" aria-label="Transactions">
              <thead className="sticky top-0 z-10 bg-card border-b border-white/[0.03] shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">
                <tr>
                  <th className="w-10 px-2 py-3 text-left">
                    <Checkbox
                      checked={selectedIds.length === sorted.length && sorted.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => toggleSort("date")}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      Date
                      <SortIcon column="date" />
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => toggleSort("merchant")}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      Merchant
                      <SortIcon column="merchant" />
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => toggleSort("amount")}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      Amount
                      <SortIcon column="amount" />
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => toggleSort("category")}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      Category
                      <SortIcon column="category" />
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => toggleSort("account")}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      Account
                      <SortIcon column="account" />
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      Status
                      <SortIcon column="status" />
                    </button>
                  </th>
                  <th className="w-12" scope="col" aria-label="Row actions" />
                </tr>
              </thead>
              <tbody>
                {(sorted ?? []).map((tx) => (
                  <tr
                    key={tx.id}
                    className={cn(
                      "border-b border-white/[0.03] transition-colors hover:bg-secondary/50",
                      tx.status === "exception" && "bg-destructive/5"
                    )}
                  >
                    <td className="px-2 py-2">
                      <Checkbox
                        checked={(selectedIds ?? []).includes(tx.id)}
                        onCheckedChange={() => handleSelectOne(tx.id)}
                        aria-label={`Select ${tx.merchant}`}
                      />
                    </td>
                    <td className="px-2 py-2 text-sm text-muted-foreground">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-2 py-2 font-medium">
                      {tx.merchant ?? "—"}
                      {tx.isSubscription && (
                        <span className="ml-1 text-xs text-muted-foreground">(sub)</span>
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-2 text-sm font-medium",
                        (tx.amount ?? 0) >= 0 ? "text-teal" : "text-foreground"
                      )}
                    >
                      {formatAmount(tx.amount ?? 0)}
                    </td>
                    <td className="px-2 py-2">
                      {editingId === tx.id ? (
                        <div className="flex flex-wrap gap-2">
                          <Select
                            value={editCategory}
                            onValueChange={setEditCategory}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Subcategory"
                            value={editSubcategory}
                            onChange={(e) => setEditSubcategory(e.target.value)}
                            className="h-8 w-24"
                          />
                          <Button size="sm" className="h-8" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getCategoryName(tx) !== "—" ? "secondary" : "outline"}
                            className={cn(
                              "text-xs",
                              isManual(tx) && "border-purple/50"
                            )}
                          >
                            {getCategoryName(tx)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 text-xs"
                            onClick={() =>
                              startEdit(
                                tx.id,
                                getCategoryName(tx),
                                tx.subcategory ?? ""
                              )
                            }
                          >
                            <Tag className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-sm text-muted-foreground">
                      {tx.accountId ?? "—"}
                    </td>
                    <td className="px-2 py-2">
                      <Badge
                        variant={
                          tx.status === "exception" ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        {tx.status ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-2 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            aria-label="Row actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              startEdit(
                                tx.id,
                                getCategoryName(tx),
                                tx.subcategory ?? ""
                              )
                            }
                          >
                            Categorize
                          </DropdownMenuItem>
                          {tx.status !== "exception" && (
                            <DropdownMenuItem
                              onClick={() =>
                                onFlagException(tx.id, "Flagged for review")
                              }
                            >
                              Flag exception
                            </DropdownMenuItem>
                          )}
                          {onExport && (
                            <DropdownMenuItem
                              onClick={() => onExport([tx.id])}
                            >
                              Export
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
