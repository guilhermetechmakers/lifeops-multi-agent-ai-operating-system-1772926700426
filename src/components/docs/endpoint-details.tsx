import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { ParamsTable } from "./params-table";
import { CodeBlock } from "./code-block";
import type { Endpoint } from "@/types/docs";

export interface EndpointDetailsProps {
  endpoint: Endpoint;
  className?: string;
}

const methodColors: Record<string, string> = {
  GET: "text-teal",
  POST: "text-amber",
  PUT: "text-purple",
  PATCH: "text-amber",
  DELETE: "text-destructive",
};

export function EndpointDetails({ endpoint, className }: EndpointDetailsProps) {
  const params = endpoint?.params ?? [];
  const responses = endpoint?.responses ?? [];
  const examples = endpoint?.examples ?? [];
  const method = (endpoint?.method ?? "GET").toUpperCase();
  const methodClass = methodColors[method] ?? "text-foreground";

  return (
    <article
      className={cn("space-y-6 rounded-xl border border-white/[0.03] bg-card p-6", className)}
      aria-labelledby={`endpoint-${endpoint?.id ?? "unknown"}-title`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("font-mono text-sm font-semibold", methodClass)}>{method}</span>
        <span className="font-mono text-sm text-muted-foreground">{endpoint?.path ?? ""}</span>
        {endpoint?.status && (
          <StatusBadge status={endpoint.status as "stable" | "beta" | "deprecated"} />
        )}
      </div>
      {endpoint?.description && (
        <p id={`endpoint-${endpoint?.id ?? "unknown"}-title`} className="text-sm text-muted-foreground">
          {endpoint.description}
        </p>
      )}

      {params.length > 0 && (
        <section aria-label="Parameters">
          <h3 className="text-sm font-semibold text-foreground mb-2">Parameters</h3>
          <ParamsTable params={params} />
        </section>
      )}

      {responses.length > 0 && (
        <section aria-label="Responses">
          <h3 className="text-sm font-semibold text-foreground mb-2">Responses</h3>
          <div className="space-y-2">
            {responses.map((r, i) => (
              <div
                key={`${r.code}-${i}`}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="font-mono text-foreground">{r.code}</span>
                <span>{r.contentType}</span>
                {r.schema && <span className="text-teal">→ {r.schema}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {examples.length > 0 && (
        <section aria-label="Examples">
          <h3 className="text-sm font-semibold text-foreground mb-2">Examples</h3>
          <div className="space-y-4">
            {(examples ?? []).map((ex, i) => (
              <CodeBlock
                key={`${ex.lang}-${i}`}
                code={ex?.code ?? ""}
                language={ex?.lang}
                label={ex?.label}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
