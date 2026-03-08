/**
 * TransactionsOverview — Transaction Feed with search, filter, categorization, rules.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Tag, Filter, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Transaction } from "@/types/finance";
import { CreateCategorizationRuleModal } from "./create-categorization-rule-modal";

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

function formatAmount(amount: number, currency: string): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface TransactionsOverviewProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onCreateRule?: () => void;
  className?: string;
}

const CATEGORIES = [
  { id: "cat-saas", name: "SaaS", color: "#8B5CF6" },
  { id: "cat-income", name: "Income", color: "#00C2A8" },
  { id: "cat-other", name: "Other", color: "#9DA3A6" },
];

export function TransactionsOverview({
  transactions,
  isLoading,
  onCreateRule,
  className,
}: TransactionsOverviewProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    let out = list;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      out = out.filter(
        (t) =>
          (t.merchant ?? "").toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      out = out.filter((t) => (t.categoryId ?? "") === categoryFilter);
    }
    return out;
  }, [transactions, debouncedSearch, categoryFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    return CATEGORIES.find((c) => c.id === categoryId)?.name ?? "Other";
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <CardTitle className="text-base font-semibold">Transactions</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search merchant, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1"
            onClick={() => setRuleModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Tag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No transactions match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting search or category filter
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-white/[0.03]">
              <input
                type="checkbox"
                checked={selectedIds.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                aria-label="Select all"
                className="rounded border-white/20"
              />
              <span className="w-[40%]">Merchant</span>
              <span className="w-[20%]">Date</span>
              <span className="w-[20%]">Category</span>
              <span className="w-[20%] text-right">Amount</span>
            </div>
            {(filtered ?? []).map((tx) => (
              <div
                key={tx.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/50",
                  tx.status === "flagged" && "bg-destructive/5"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(tx.id)}
                  onChange={() => toggleSelect(tx.id)}
                  aria-label={`Select ${tx.merchant}`}
                  className="rounded border-white/20"
                />
                <span className="w-[40%] truncate font-medium">{tx.merchant ?? "—"}</span>
                <span className="w-[20%] text-muted-foreground text-sm">
                  {formatDate(tx.date)}
                </span>
                <Badge
                  variant={tx.categoryId ? "secondary" : "outline"}
                  className="w-[20%] justify-center text-xs"
                >
                  {getCategoryName(tx.categoryId)}
                </Badge>
                <span
                  className={cn(
                    "w-[20%] text-right text-sm font-medium",
                    (tx.amount ?? 0) >= 0 ? "text-teal" : "text-foreground"
                  )}
                >
                  {formatAmount(tx.amount ?? 0, tx.currency ?? "USD")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CreateCategorizationRuleModal
        open={ruleModalOpen}
        onOpenChange={setRuleModalOpen}
        onSuccess={() => onCreateRule?.()}
      />
    </Card>
  );
}
