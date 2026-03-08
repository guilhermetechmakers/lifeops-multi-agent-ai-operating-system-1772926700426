/**
 * TOC — Table of Contents with anchor links for ToS sections.
 * Supports smooth scrolling and keyboard navigation.
 */

import { cn } from "@/lib/utils";
import type { ToSSection } from "@/types/terms-of-service";

export interface TOCProps {
  sections?: ToSSection[] | null;
  className?: string;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function TOC({ sections = [], className }: TOCProps) {
  const safeSections = Array.isArray(sections) ? sections : [];

  if (safeSections.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn("space-y-2", className)}
      aria-label="Table of contents"
    >
      <h2 className="text-sm font-semibold text-foreground mb-3">
        On this page
      </h2>
      <ul className="space-y-2">
        {(safeSections ?? []).map((section) => {
          const id = section?.id ?? "";
          const title = section?.title ?? "";
          if (!id || !title) return null;

          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(id);
                }}
                className="text-sm text-muted-foreground hover:text-teal transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                {title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
