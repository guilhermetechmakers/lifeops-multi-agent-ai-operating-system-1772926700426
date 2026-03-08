/**
 * Transactions & Categorization page — List/manage transactions.
 * Manual categorization, categorization rules, mark exceptions, reconcile, audit.
 */

import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, LayoutDashboard, Tag } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useTransactions,
  useCategorizationRules,
  useExceptions,
  useAuditLogs,
  useLatestIngestion,
  useTriggerIngestion,
  useCategorizeTransaction,
  useBulkCategorize,
  useAddTransactionException,
  useReconcileMatch,
  useCreateCategorizationRule,
  useUpdateCategorizationRule,
  useDeleteCategorizationRule,
} from "@/hooks/use-transactions-categorization";
import { useFinanceDashboard } from "@/hooks/use-finance";
import {
  TransactionsTable,
  BulkActionsToolbar,
  IngestionStatusWidget,
  CategorizationRulesPanel,
  ExceptionsPanel,
  ReconciliationToolkit,
  AuditTrailPanel,
  DashboardLinkers,
} from "@/components/transactions-categorization";
import type { TransactionEnriched } from "@/types/finance";

export default function FinanceTransactionsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters = useMemo(() => {
    const f: { dateFrom?: string; dateTo?: string; category?: string; status?: string } = {};
    if (dateFrom.trim()) f.dateFrom = dateFrom.trim();
    if (dateTo.trim()) f.dateTo = dateTo.trim();
    if (categoryFilter !== "all") f.category = categoryFilter;
    if (statusFilter !== "all") f.status = statusFilter;
    return f;
  }, [dateFrom, dateTo, categoryFilter, statusFilter]);

  const { transactions: txData, isLoading } = useTransactions(filters);
  const { rules } = useCategorizationRules();
  const { exceptions } = useExceptions();
  const { logs } = useAuditLogs();
  const { ingestion } = useLatestIngestion();
  const triggerIngestion = useTriggerIngestion();
  const { subscriptions } = useFinanceDashboard();

  const categorizeTx = useCategorizeTransaction();
  const bulkCategorize = useBulkCategorize();
  const addException = useAddTransactionException();
  const reconcileMatch = useReconcileMatch();
  const createRule = useCreateCategorizationRule();
  const updateRule = useUpdateCategorizationRule();
  const deleteRule = useDeleteCategorizationRule();

  const items = Array.isArray(txData) ? txData : [];
  const filtered = useMemo(() => {
    let out = items;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      out = out.filter((t) =>
        (t.merchant ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      out = out.filter(
        (t) =>
          (t.category ?? t.categorizedCategory ?? "") === categoryFilter
      );
    }
    if (statusFilter !== "all") {
      out = out.filter((t) => (t.status ?? "") === statusFilter);
    }
    return out;
  }, [items, debouncedSearch, categoryFilter, statusFilter]);

  const uncategorizedCount = items.filter(
    (t) => !(t.category ?? t.categorizedCategory)
  ).length;
  const exceptionCount = items.filter((t) => t.status === "exception").length;

  const transactionMap = useMemo(() => {
    const m = new Map<string, TransactionEnriched>();
    (items ?? []).forEach((t) => m.set(t.id, t));
    return m;
  }, [items]);

  const handleCategorize = useCallback(
    (id: string, category: string, subcategory?: string) => {
      categorizeTx.mutate({ id, category, subcategory });
    },
    [categorizeTx]
  );

  const handleFlagException = useCallback(
    (id: string, reason: string, notes?: string) => {
      addException.mutate({ id, reason, notes });
    },
    [addException]
  );

  const handleExport = useCallback((ids: string[], format: "csv" | "json") => {
    const selected = (ids ?? []).map((id) =>
      items.find((t) => t.id === id)
    ).filter(Boolean);
    if (format === "csv") {
      const header = "Date,Merchant,Amount,Category,Status\n";
      const rows = selected
        .map((t) =>
          [
            t?.date ?? "",
            `"${(t?.merchant ?? "").replace(/"/g, '""')}"`,
            t?.amount ?? 0,
            t?.category ?? t?.categorizedCategory ?? "",
            t?.status ?? "",
          ].join(",")
        )
        .join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(selected, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [items]);

  const handleBulkCategorize = useCallback(
    (ids: string[], category: string, subcategory?: string) => {
      bulkCategorize.mutate({ transactionIds: ids, category, subcategory });
    },
    [bulkCategorize]
  );

  const handleBulkExport = useCallback(
    (ids: string[], format: "csv" | "json") => {
      handleExport(ids, format);
    },
    [handleExport]
  );

  const handleBulkFlag = useCallback(
    (ids: string[], notes?: string) => {
      (ids ?? []).forEach((id) =>
        addException.mutate({ id, reason: "Flagged for review", notes })
      );
    },
    [addException]
  );

  const handleBulkNote = useCallback(
    (_ids: string[], _note: string) => {
      // Stub: add note to transactions (would need API support)
    },
    []
  );

  const handleReconcileMatch = useCallback(
    (
      transactionId: string,
      subscriptionId?: string | null,
      invoiceId?: string | null
    ) => {
      reconcileMatch.mutate({ transactionId, subscriptionId, invoiceId });
    },
    [reconcileMatch]
  );

  const handleCreateRule = useCallback(
    (data: Parameters<typeof createRule.mutate>[0]) => {
      createRule.mutate(data);
    },
    [createRule]
  );

  const handleDeleteRule = useCallback(
    (id: string) => {
      deleteRule.mutate(id);
    },
    [deleteRule]
  );

  const handleSelectAllFiltered = useCallback(() => {
    setSelectedIds(filtered.map((t) => t.id));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Transactions & Categorization
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage transactions, create rules, mark exceptions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/dashboard/finance"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Finance Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        <div className="space-y-6 min-w-0">
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
            <div className="text-2xl font-bold text-foreground">
              {uncategorizedCount}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {exceptionCount}
            </div>
          </CardContent>
        </Card>
        <IngestionStatusWidget
          ingestion={ingestion}
          onRerun={() => triggerIngestion.mutate()}
          isRerunning={triggerIngestion.isPending}
        />
          </div>

          <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
            aria-label="Search by merchant"
          />
        </div>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[140px] h-9"
          aria-label="Date from"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[140px] h-9"
          aria-label="Date to"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <Filter className="h-4 w-4 mr-1" aria-hidden />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="SaaS">SaaS</SelectItem>
            <SelectItem value="Income">Income</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ingested">Ingested</SelectItem>
            <SelectItem value="enriched">Enriched</SelectItem>
            <SelectItem value="categorized">Categorized</SelectItem>
            <SelectItem value="exception">Exception</SelectItem>
          </SelectContent>
        </Select>
          </div>

          <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onCategorize={handleBulkCategorize}
        onExport={handleBulkExport}
        onFlagForReview={handleBulkFlag}
        onAddNote={handleBulkNote}
        onSelectAllFiltered={handleSelectAllFiltered}
      />

      <TransactionsTable
        transactions={filtered}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onCategorize={handleCategorize}
        onFlagException={handleFlagException}
        onExport={(ids) => handleExport(ids, "csv")}
        isLoading={isLoading}
          />

          <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules" className="gap-1">
            <Tag className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="reconcile">Reconcile</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="mt-4">
          <CategorizationRulesPanel
            rules={rules}
            transactions={items}
            onCreateRule={handleCreateRule}
            onUpdateRule={(id, updates) => updateRule.mutate({ id, payload: updates })}
            onDeleteRule={handleDeleteRule}
          />
        </TabsContent>
        <TabsContent value="exceptions" className="mt-4">
          <ExceptionsPanel
            exceptions={exceptions}
            transactions={items}
            transactionById={(id) => transactionMap.get(id)}
            onAddException={(txId, reason, notes) =>
              addException.mutate({ id: txId, reason, notes })
            }
          />
        </TabsContent>
        <TabsContent value="reconcile" className="mt-4">
          <ReconciliationToolkit
            transactions={items}
            subscriptions={(subscriptions ?? []).map((s) => ({
              id: s.id,
              provider: s.provider,
              amount: s.amount,
            }))}
            onMatch={handleReconcileMatch}
          />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditTrailPanel logs={logs} />
        </TabsContent>
          </Tabs>
        </div>
        <Card className="border-white/[0.03] bg-card h-fit p-4">
          <DashboardLinkers />
        </Card>
      </div>
    </div>
  );
}
