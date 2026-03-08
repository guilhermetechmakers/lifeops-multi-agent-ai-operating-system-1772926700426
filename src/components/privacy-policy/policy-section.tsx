/**
 * PolicySection — Reusable section with optional subheadings, paragraphs, bullet lists.
 * Guards against null/undefined content.
 */

import type { ReactNode } from "react";
import { TypographyBlock } from "./typography-block";
import { cn } from "@/lib/utils";
import type { PolicySection as PolicySectionType } from "@/types/privacy-policy";

interface PolicySectionProps {
  section: PolicySectionType;
  className?: string;
}

function renderContent(content: string | string[] | undefined): ReactNode {
  if (content == null) return null;
  if (typeof content === "string") {
    return <p className="text-sm text-foreground leading-relaxed">{content}</p>;
  }
  if (Array.isArray(content)) {
    return (
      <ul className="list-disc pl-6 space-y-2 text-sm text-foreground leading-relaxed">
        {content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return null;
}

export function PolicySection({ section, className }: PolicySectionProps) {
  const { title, content, subsections } = section ?? {};
  const safeSubsections = Array.isArray(subsections) ? subsections : [];

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby={title ? `section-${title.replace(/\s+/g, "-").toLowerCase()}` : undefined}
    >
      {title && (
        <TypographyBlock
          variant="h2"
          as="h2"
          id={title ? `section-${title.replace(/\s+/g, "-").toLowerCase()}` : undefined}
        >
          {title}
        </TypographyBlock>
      )}
      {content != null && <div className="space-y-2">{renderContent(content)}</div>}
      {safeSubsections.length > 0 && (
        <div className="space-y-4 pl-0 sm:pl-2">
          {safeSubsections.map((sub, idx) => (
            <div key={sub?.title ?? idx} className="space-y-2">
              {sub?.title && (
                <TypographyBlock variant="h3" as="h3">
                  {sub.title}
                </TypographyBlock>
              )}
              {sub?.content != null && renderContent(sub.content)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
