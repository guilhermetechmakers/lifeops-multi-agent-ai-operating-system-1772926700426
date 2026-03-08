/**
 * DataSectionList — Renders a sequence of PolicySection items.
 * Guards: (sections ?? []), Array.isArray checks.
 */

import { PolicySection } from "./policy-section";
import type { PolicySection as PolicySectionType } from "@/types/privacy-policy";

interface DataSectionListProps {
  sections?: PolicySectionType[] | null;
  className?: string;
}

export function DataSectionList({ sections = [], className }: DataSectionListProps) {
  const safeSections = Array.isArray(sections) ? sections : [];

  if (safeSections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Content coming soon.</p>
    );
  }

  return (
    <div className={className}>
      {safeSections.map((section, idx) => (
        <PolicySection
          key={section?.id ?? idx}
          section={section}
          className={idx > 0 ? "pt-8 border-t border-white/[0.03]" : ""}
        />
      ))}
    </div>
  );
}
