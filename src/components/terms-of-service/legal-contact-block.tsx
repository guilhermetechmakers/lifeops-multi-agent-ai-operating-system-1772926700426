/**
 * LegalContactBlock — Contact for legal inquiries.
 * Email link and optional contact form per ToS spec.
 */

import { useState } from "react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactForm } from "./contact-form";
import { Button } from "@/components/ui/button";

export interface LegalContactBlockProps {
  contactEmail?: string;
  contactLabel?: string;
  showForm?: boolean;
  className?: string;
}

const DEFAULT_EMAIL = "legal@lifeops.io";
const DEFAULT_LABEL = "Legal inquiries";

export function LegalContactBlock({
  contactEmail = DEFAULT_EMAIL,
  contactLabel = DEFAULT_LABEL,
  showForm = true,
  className,
}: LegalContactBlockProps) {
  const [formExpanded, setFormExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6 space-y-4",
        className
      )}
      role="region"
      aria-labelledby="legal-contact-heading"
      aria-label="Contact for legal inquiries"
    >
      <h2
        id="legal-contact-heading"
        className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground"
      >
        Contact for legal inquiries
      </h2>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Mail
            className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5"
            aria-hidden
          />
          <div>
            <p className="text-sm font-medium text-foreground">{contactLabel}</p>
            <a
              href={`mailto:${contactEmail}`}
              className="text-sm text-teal hover:text-teal/90 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded transition-colors duration-120"
            >
              {contactEmail}
            </a>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          For questions about these Terms of Service or other legal matters,
          contact our Legal team via email. We aim to respond within 5 business
          days.
        </p>
      </div>

      {showForm && (
        <div className="pt-4 border-t border-white/[0.03]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormExpanded((p) => !p)}
            aria-expanded={formExpanded}
            aria-controls="tos-contact-form"
          >
            {formExpanded ? "Hide contact form" : "Send a message"}
          </Button>
          {formExpanded && (
            <div id="tos-contact-form" className="mt-4">
              <ContactForm />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
