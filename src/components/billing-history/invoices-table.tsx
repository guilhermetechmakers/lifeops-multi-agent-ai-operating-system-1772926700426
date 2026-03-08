/**
 * InvoicesTable — sortable columns (date, amount, status), status badges, per-row actions.
 * Uses (invoices ?? []) for all maps; guards against null arrays.
 */

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { FileText, Download, Eye, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Invoice, InvoiceStatus } from "@/types/billing-history";

type SortKey = "date" | "amount" | "status" | "invoice_number";

export interface InvoicesTableProps {
  invoices: Invoice[];
  onView: (invoiceId: string) => void;
  onDownload: (invoiceId: string) => void;
  onPay?: (invoiceId: string) => void;
  isLoading?: boolean;
}

function statusVariant(s: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "paid":
      return "secondary";
    case "due":
      return "default";
    case "overdue":
      return "destructive";
    case "canceled":
      return "outline";
    default:
      return "secondary";
  }
}

export function InvoicesTable({
  invoices,
  onView,
  onDownload,
  onPay,
  isLoading = false,
}: InvoicesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const safeInvoices = invoices ?? [];
  const sorted = useMemo(() => {
    const list = [...safeInvoices];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":
          cmp = (a.date ?? "").localeCompare(b.date ?? "");
          break;
        case "amount":
          cmp = (a.amount_due ?? 0) - (b.amount_due ?? 0);
          break;
        case "status":
          cmp = (a.status ?? "").localeCompare(b.status ?? "");
          break;
        case "invoice_number":
          cmp = (a.invoice_number ?? "").localeCompare(b.invoice_number ?? "");
          break;
        default:
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [safeInvoices, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    setSortKey(key);
    setSortDir((d) => (sortKey === key && d === "desc" ? "asc" : "desc"));
  };

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Invoices
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View details, download PDF, or pay when due
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid" aria-label="Invoices">
            <thead>
              <tr className="border-b border-white/[0.03] bg-secondary/30 sticky top-0">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => toggleSort("invoice_number")}
                  >
                    Invoice
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => toggleSort("date")}
                  >
                    Date
                  </button>
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors ml-auto block"
                    onClick={() => toggleSort("amount")}
                  >
                    Amount
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => toggleSort("status")}
                  >
                    Status
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Due date
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    Loading…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    No invoices found
                  </td>
                </tr>
              ) : (
                (sorted ?? []).map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-white/[0.03] hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {inv.invoice_number ?? inv.id}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {inv.date ? format(new Date(inv.date), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {inv.currency ?? "USD"} {(inv.amount_due ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant(inv.status)}>
                        {inv.status ?? "—"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onView(inv.id)}
                          aria-label={`View invoice ${inv.invoice_number}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDownload(inv.id)}
                          aria-label={`Download invoice ${inv.invoice_number}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {onPay && (inv.status === "due" || inv.status === "overdue") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPay(inv.id)}
                            aria-label={`Pay invoice ${inv.invoice_number}`}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
