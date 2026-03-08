import { useQuery } from "@tanstack/react-query";
import { fetchDocsApis } from "@/api/docs";
import { safeArray } from "@/lib/api/guards";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EndpointDetails } from "./endpoint-details";
import type { APIDocSection, Endpoint } from "@/types/docs";

export function APIDocPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { data, isLoading, isError } = useQuery({
    queryKey: ["docs", "apis"],
    queryFn: () => fetchDocsApis(),
  });

  const sections: APIDocSection[] = Array.isArray(data?.data) ? data.data : [];
  const toggle = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Failed to load API reference. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">API Reference</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          REST endpoints for cronjobs, agents, and run artifacts. All require authentication.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const endpoints = safeArray<Endpoint>(section?.endpoints);
          const isOpen = openSections[section?.id ?? ""] ?? true;
          return (
            <Collapsible
              key={section?.id ?? ""}
              open={isOpen}
              onOpenChange={() => toggle(section?.id ?? "")}
            >
              <div className="rounded-lg border border-white/[0.03] bg-card overflow-hidden">
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors duration-120"
                  )}
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <span>{section?.title ?? ""}</span>
                  <span className="text-muted-foreground font-normal">
                    — {section?.description ?? ""}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-white/[0.03] p-4 space-y-6">
                    {endpoints.map((ep) => (
                      <EndpointDetails key={ep?.id ?? ""} endpoint={ep} />
                    ))}
                    {endpoints.length === 0 && (
                      <p className="text-sm text-muted-foreground">No endpoints in this section.</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground">No API sections available.</p>
      )}
    </div>
  );
}
