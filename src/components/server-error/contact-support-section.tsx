/**
 * ContactSupportSection — CTA to open support modal or navigate to support.
 * Accessible button with clear label.
 */

import * as React from "react";
import { Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SupportModal } from "./support-modal";
import type { ErrorContext, SupportTicketPayload } from "@/types/server-error";

export interface ContactSupportSectionProps {
  errorContext?: ErrorContext | null;
  onSupportSubmit?: (payload: SupportTicketPayload) => void | Promise<void>;
  className?: string;
}

export function ContactSupportSection({
  errorContext,
  onSupportSubmit,
  className,
}: ContactSupportSectionProps) {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <section
        className={cn("space-y-2", className)}
        aria-label="Contact support"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => setModalOpen(true)}
          className="min-h-[44px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Open contact support form"
        >
          <Headphones className="h-4 w-4" aria-hidden />
          Contact Support
        </Button>
      </section>
      <SupportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        errorContext={errorContext ?? null}
        onSubmit={onSupportSubmit}
      />
    </>
  );
}
