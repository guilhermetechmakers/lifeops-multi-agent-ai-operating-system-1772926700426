/**
 * FAQSearchPanel — Searchable FAQ with filter chips and expandable answers.
 * Data: questions array; guarded with (questions ?? []) and Array.isArray.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SectionTitle } from "./section-title";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQ } from "@/types/about-help";

interface FAQSearchPanelProps {
  questions?: FAQ[] | null;
  className?: string;
}

const ALL_TAG = "All";

export function FAQSearchPanel({ questions, className }: FAQSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(ALL_TAG);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = Array.isArray(questions) ? questions : (questions ?? []);
  const tags = useMemo(() => {
    const set = new Set<string>();
    list.forEach((q) => {
      const t = q.tags ?? [];
      if (Array.isArray(t)) t.forEach((tag) => set.add(tag));
    });
    return [ALL_TAG, ...Array.from(set)];
  }, [list]);

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    const byTag = activeTag === ALL_TAG ? list : list.filter((item) => (item.tags ?? []).includes(activeTag));
    if (!q) return byTag;
    return byTag.filter(
      (item) =>
        (item.question ?? "").toLowerCase().includes(q) ||
        (item.answer ?? "").toLowerCase().includes(q)
    );
  }, [list, query, activeTag]);

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] shadow-card transition-all duration-200",
        className
      )}
    >
      <CardHeader className="pb-3">
        <SectionTitle>FAQ</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Search and filter frequently asked questions.
        </p>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search FAQs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search FAQ"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                activeTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <ul className="space-y-1" role="list" aria-label="FAQ list">
          {(filtered ?? []).map((item) => (
            <li key={item.id}>
              <Collapsible
                open={openId === item.id}
                onOpenChange={(open) => setOpenId(open ? item.id : null)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border border-white/[0.03] bg-card/50 px-4 py-3 text-left text-sm transition-colors hover:bg-secondary/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-expanded={openId === item.id}
                >
                  <span className="font-medium text-foreground">
                    {item.question ?? "Untitled"}
                  </span>
                  {openId === item.id ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                    {item.answer ?? ""}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No matching questions.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
