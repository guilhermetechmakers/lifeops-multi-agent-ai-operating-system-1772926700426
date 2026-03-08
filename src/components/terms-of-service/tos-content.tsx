/**
 * ToSContent — Reusable section with optional subheadings, paragraphs, bullet lists.
 * Guards against null/undefined content.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ToSSection } from "@/types/terms-of-service";

function renderContent(content: string | string[] | undefined): ReactNode {
  if (content == null) return null;
  if (typeof content === "string") {
    return (
      <p className="text-sm text-foreground leading-relaxed">{content}</p>
    );
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

export interface ToSContentProps {
  section: ToSSection;
  className?: string;
}

export function ToSContent({ section, className }: ToSContentProps) {
  const { id, title, content, subsections } = section ?? {};
  const safeSubsections = Array.isArray(subsections) ? subsections : [];
  const sectionId = id ?? title?.replace(/\s+/g, "-").toLowerCase() ?? "";

  return (
    <section
      id={sectionId}
      className={cn("space-y-4 scroll-mt-24", className)}
      aria-labelledby={title ? `section-${sectionId}` : undefined}
    >
      {title && (
        <h2
          id={`section-${sectionId}`}
          className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
      )}
      {content != null && <div className="space-y-2">{renderContent(content)}</div>}
      {safeSubsections.length > 0 && (
        <div className="space-y-4 pl-0 sm:pl-2">
          {safeSubsections.map((sub, idx) => (
            <div key={sub?.title ?? idx} className="space-y-2">
              {sub?.title && (
                <h3 className="text-base font-medium text-foreground">
                  {sub.title}
                </h3>
              )}
              {sub?.content != null && renderContent(sub.content)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
