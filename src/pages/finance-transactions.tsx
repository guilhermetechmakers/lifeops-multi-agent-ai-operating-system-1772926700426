/**
 * Transactions & Categorization page — List/manage transactions.
 * Manual categorization, categorization rules, mark exceptions.
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
import { useFinanceDashboard } from "@/hooks/use-finance";
import { CreateCategorizationRuleModal } from "@/components/finance-dashboard";

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

const CATEGORIES = [
  { id: "cat-saas", name: "SaaS", color: "#8B5CF6" },
  { id: "cat-income", name: "Income", color: "#00C2A8" },
  { id: "cat-other", name: "Other", color: "#9DA3A6" },
];

export default function FinanceTransactionsPage() {
  const { transactions, isLoading } = useFinanceDashboard();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ruleModalOpen, setRuleModalOpen] = useState(false);

  const items = Array.isArray(transactions) ? transactions : [];
  const filtered = useMemo(() => {
    let out = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (t) =>
          (t.merchant ?? "").toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      out = out.filter((t) => (t.categoryId ?? "") === categoryFilter);
    }
    if (statusFilter !== "all") {
      out = out.filter((t) => (t.status ?? "") === statusFilter);
    }
    return out;
  }, [items, search, categoryFilter, statusFilter]);

  const uncategorizedCount = items.filter((t) => !t.categoryId).length;
  const flaggedCount = items.filter((t) => t.status === "flagged").length;

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    return CATEGORIES.find((c) => c.id === categoryId)?.name ?? "Other";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Transactions & Categorization</h2>
        <p className="text-sm text-muted-foreground">
          Manage transactions, create rules, mark exceptions
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{items.length}</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uncategorized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uncategorizedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Flagged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{flaggedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setRuleModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create rule
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">Transaction Feed</CardTitle>
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
              <SelectTrigger className="w-[140px] h-9">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No transactions match your filters</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-white/[0.03]">
                <span className="w-[35%]">Merchant</span>
                <span className="w-[15%]">Date</span>
                <span className="w-[20%]">Category</span>
                <span className="w-[15%]">Status</span>
                <span className="w-[15%] text-right">Amount</span>
              </div>
              {(filtered ?? []).map((tx) => (
                <div
                  key={tx.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/50",
                    tx.status === "flagged" && "bg-destructive/5"
                  )}
                >
                  <span className="w-[35%] truncate font-medium">{tx.merchant ?? "—"}</span>
                  <span className="w-[15%] text-muted-foreground text-sm">
                    {formatDate(tx.date)}
                  </span>
                  <Badge
                    variant={tx.categoryId ? "secondary" : "outline"}
                    className="w-[20%] justify-center text-xs"
                  >
                    {getCategoryName(tx.categoryId)}
                  </Badge>
                  <Badge
                    variant={tx.status === "flagged" ? "destructive" : "outline"}
                    className="w-[15%] justify-center text-xs"
                  >
                    {tx.status ?? "—"}
                  </Badge>
                  <span
                    className={cn(
                      "w-[15%] text-right text-sm font-medium",
                      (tx.amount ?? 0) >= 0 ? "text-teal" : "text-foreground"
                    )}
                  >
                    {formatAmount(tx.amount ?? 0, tx.currency ?? "USD")}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                    Categorize
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateCategorizationRuleModal
        open={ruleModalOpen}
        onOpenChange={setRuleModalOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}
