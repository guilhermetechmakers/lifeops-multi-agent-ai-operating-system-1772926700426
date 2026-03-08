/**
 * Sidebar tree of domains with collapsible persona nodes.
 */

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText,
  Wallet,
  Heart,
  User,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Persona, TemplateDomain } from "@/types/templates-personas";

const DOMAIN_ICONS: Record<TemplateDomain, React.ComponentType<{ className?: string }>> = {
  developer: FileCode,
  content: FileText,
  finance: Wallet,
  health: Heart,
};

const DOMAIN_LABELS: Record<TemplateDomain, string> = {
  developer: "Developer",
  content: "Content",
  finance: "Finance",
  health: "Health",
};

export interface PersonaDomainTreeProps {
  personas: Persona[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function groupByDomain(personas: Persona[]): Record<TemplateDomain, Persona[]> {
  const groups: Record<string, Persona[]> = {
    developer: [],
    content: [],
    finance: [],
    health: [],
  };
  const list = Array.isArray(personas) ? personas : [];
  list.forEach((p) => {
    if (groups[p.domain]) groups[p.domain].push(p);
  });
  return groups as Record<TemplateDomain, Persona[]>;
}

export function PersonaDomainTree({
  personas,
  selectedId,
  onSelect,
}: PersonaDomainTreeProps) {
  const [openDomains, setOpenDomains] = useState<Set<TemplateDomain>>(
    new Set(["developer", "content", "finance", "health"])
  );

  const groups = groupByDomain(personas);

  const toggleDomain = (domain: TemplateDomain) => {
    setOpenDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  return (
    <nav className="space-y-1" aria-label="Persona domains">
      {(Object.keys(groups) as TemplateDomain[]).map((domain) => {
        const items = groups[domain] ?? [];
        const Icon = DOMAIN_ICONS[domain];
        const isOpen = openDomains.has(domain);

        return (
          <Collapsible
            key={domain}
            open={isOpen}
            onOpenChange={() => toggleDomain(domain)}
          >
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span>{DOMAIN_LABELS[domain]}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {items.length}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="ml-6 mt-1 space-y-0.5" role="list">
                {(items ?? []).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(p.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        selectedId === p.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}
