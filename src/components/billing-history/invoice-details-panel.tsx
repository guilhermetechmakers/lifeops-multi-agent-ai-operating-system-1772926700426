/**
 * InvoiceDetailsPanel — expandable line items, totals, tax breakdown, download link.
 */

import { format } from "date-fns";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Invoice, LineItem } from "@/types/billing-history";

export interface InvoiceDetailsPanelProps {
  invoice: Invoice | null;
  onClose: () => void;
  onDownload: (invoiceId: string) => void;
}

export function InvoiceDetailsPanel({
  invoice,
  onClose,
  onDownload,
}: InvoiceDetailsPanelProps) {
  if (!invoice) return null;

  const lineItems: LineItem[] = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const total = lineItems.reduce((sum, li) => sum + (li?.amount ?? 0), 0) || (invoice.amount_due ?? 0);

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border-white/[0.03] bg-card" showClose={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Invoice {invoice.invoice_number ?? invoice.id}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Date</span>
              <span>{invoice.date ? format(new Date(invoice.date), "MMM d, yyyy") : "—"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Due date</span>
              <span>{invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "—"}</span>
            </div>
            <div className="border-t border-white/[0.03] pt-3 mt-3">
              <p className="font-medium text-foreground mb-2">Line items</p>
              <ul className="space-y-2">
                {(lineItems ?? []).map((li) => (
                  <li
                    key={li?.id ?? Math.random()}
                    className="flex justify-between py-1 border-b border-white/[0.03] last:border-0"
                  >
                    <span className="text-foreground">{li?.description ?? "—"}</span>
                    <span className="text-muted-foreground">
                      {invoice.currency ?? "USD"} {(li?.amount ?? 0).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between font-semibold text-foreground pt-2">
              <span>Total</span>
              <span>
                {invoice.currency ?? "USD"} {total.toFixed(2)}
              </span>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            className="gap-2"
            onClick={() => onDownload(invoice.id)}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
