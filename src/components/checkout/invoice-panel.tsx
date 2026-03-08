/**
 * InvoicePanel — post-purchase: download invoice, view receipt, share options.
 */

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, Check } from "lucide-react";
import type { Invoice } from "@/types/checkout";

export interface InvoicePanelProps {
  invoice?: Invoice | null;
  invoiceId: string | null;
  onLoadInvoice?: (id: string) => Promise<Invoice | null>;
  /** Optional direct values for success view (no load needed) */
  amount?: number;
  currency?: string;
  date?: string;
  pdfUrl?: string;
  onDownload?: () => void;
  onEmailReceipt?: () => void;
  className?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function InvoicePanel({
  invoice,
  invoiceId,
  onLoadInvoice,
  amount: amountProp,
  currency: currencyProp,
  date: dateProp,
  pdfUrl: pdfUrlProp,
  onDownload,
  onEmailReceipt,
  className,
}: InvoicePanelProps) {
  useEffect(() => {
    if (invoiceId && !invoice) {
      onLoadInvoice?.(invoiceId);
    }
  }, [invoiceId, invoice, onLoadInvoice]);

  if (!invoiceId) return null;

  const inv = invoice;
  const amount = amountProp ?? inv?.amount ?? 0;
  const currency = currencyProp ?? inv?.currency ?? "USD";
  const date = dateProp
    ? (dateProp.length > 10 ? formatDate(dateProp) : dateProp)
    : (inv?.date ? formatDate(inv.date) : "");
  const pdfUrl = pdfUrlProp ?? inv?.pdfUrl;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Check className="h-5 w-5 text-teal" aria-hidden />
          Payment successful
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Invoice</dt>
            <dd className="font-mono">{invoiceId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Amount</dt>
            <dd>{formatCurrency(amount, currency)}</dd>
          </div>
          {date && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date</dt>
              <dd>{date}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          {(pdfUrl || onDownload) && (
            pdfUrl ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                className="min-h-[44px]"
                asChild
              >
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="h-4 w-4 mr-2" aria-hidden />
                  Download invoice
                </a>
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                className="min-h-[44px]"
                onClick={onDownload}
              >
                <Download className="h-4 w-4 mr-2" aria-hidden />
                Download invoice
              </Button>
            )
          )}
          {onEmailReceipt && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEmailReceipt}
              className="min-h-[44px]"
            >
              <Mail className="h-4 w-4 mr-2" aria-hidden />
              Email receipt
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
