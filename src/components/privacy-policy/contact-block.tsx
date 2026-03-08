/**
 * ContactBlock — DPO contact details and data request process.
 * Displays privacy contact, submission methods, and response timelines.
 */

import { Mail, Clock } from "lucide-react";
import { TypographyBlock } from "./typography-block";
import { cn } from "@/lib/utils";

export interface ContactBlockProps {
  contactEmail?: string;
  contactLabel?: string;
  processDescription?: string;
  responseTimeline?: string;
  className?: string;
}

const DEFAULT_EMAIL = "privacy@lifeops.io";
const DEFAULT_LABEL = "Privacy & Data Protection";
const DEFAULT_PROCESS =
  "Submit data access, correction, deletion, or portability requests via email. Include your account identifier and a clear description of your request.";
const DEFAULT_TIMELINE = "We aim to respond within 30 days of receipt.";

export function ContactBlock({
  contactEmail = DEFAULT_EMAIL,
  contactLabel = DEFAULT_LABEL,
  processDescription = DEFAULT_PROCESS,
  responseTimeline = DEFAULT_TIMELINE,
  className,
}: ContactBlockProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6 space-y-4",
        className
      )}
      role="region"
      aria-label="Contact information"
    >
      <TypographyBlock variant="h2" as="h2">
        Contact information
      </TypographyBlock>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{contactLabel}</p>
            <a
              href={`mailto:${contactEmail}`}
              className="text-sm text-teal hover:text-teal/90 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {contactEmail}
            </a>
          </div>
        </div>
        <TypographyBlock variant="body">{processDescription}</TypographyBlock>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" aria-hidden />
          <TypographyBlock variant="meta">{responseTimeline}</TypographyBlock>
        </div>
      </div>
    </div>
  );
}
