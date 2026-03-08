/**
 * ReceiptsDownloader — generate/download PDF or CSV; error handling.
 */

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as api from "@/api/billing-history";

export interface ReceiptsDownloaderProps {
  receiptId?: string | null;
  invoiceId?: string | null;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ReceiptsDownloader({
  receiptId,
  invoiceId,
  label = "Download",
  variant = "outline",
  size = "sm",
  className,
}: ReceiptsDownloaderProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    const id = receiptId ?? invoiceId;
    if (!id) {
      toast.error("No receipt or invoice ID");
      return;
    }
    setLoading(true);
    try {
      const url = receiptId
        ? await api.getReceiptDownloadUrl(id)
        : await api.getInvoiceDownloadUrl(id);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        toast.success("Download started");
      } else {
        toast.info("Download link not available");
      }
    } catch {
      toast.error("Failed to get download link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={loading || (!receiptId && !invoiceId)}
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label && size !== "icon" && <span className="ml-1">{label}</span>}
    </Button>
  );
}
