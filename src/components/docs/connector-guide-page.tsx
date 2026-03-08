import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchDocsConnectors } from "@/api/docs";
import { safeArray } from "@/lib/api/guards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConnectorGuide, Step } from "@/types/docs";

export function ConnectorGuidePage() {
  const { id } = useParams<{ id?: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["docs", "connectors"],
    queryFn: () => fetchDocsConnectors(),
  });

  const connectors: ConnectorGuide[] = Array.isArray(data?.data) ? data.data : [];
  const guide = id ? connectors.find((c) => c?.id === id) : null;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-secondary" />
        <div className="h-48 animate-pulse rounded-lg bg-secondary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Failed to load connector guides.
      </div>
    );
  }

  if (id && guide) {
    const steps = safeArray<Step>(guide?.steps).sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    const permissions = guide?.permissions ?? [];
    return (
      <div className="space-y-8 p-6">
        <div>
          <Link to="/docs/connectors" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Connectors
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">{guide.title}</h1>
          {permissions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {permissions.map((p, i) => (
                <Badge key={`${p.scope}-${i}`} variant="secondary" className="text-xs">
                  {p.scope}
                  {p.required ? " (required)" : ""}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {((guide?.prerequisites ?? []) as string[]).length > 0 && (
          <section aria-label="Prerequisites">
            <h2 className="text-lg font-medium text-foreground mb-2">Prerequisites</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {(guide.prerequisites ?? []).map((pr, i) => (
                <li key={i}>{pr}</li>
              ))}
            </ul>
          </section>
        )}

        <section aria-label="Setup steps">
          <h2 className="text-lg font-medium text-foreground mb-4">Setup steps</h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={step?.order ?? i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                  {step?.order ?? i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{step?.title ?? ""}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step?.body ?? ""}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {permissions.length > 0 && (
          <section aria-label="Permissions">
            <h2 className="text-lg font-medium text-foreground mb-2">Permissions</h2>
            <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-secondary/30">
                    <th className="px-4 py-2 text-left font-medium text-foreground">Scope</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Description</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p, i) => (
                    <tr key={i} className="border-b border-white/[0.03] last:border-0">
                      <td className="px-4 py-2 font-mono text-teal">{p.scope}</td>
                      <td className="px-4 py-2 text-muted-foreground">{p.description}</td>
                      <td className="px-4 py-2">{p.required ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {guide?.troubleshooting && (
          <section aria-label="Troubleshooting">
            <h2 className="text-lg font-medium text-foreground mb-2">Troubleshooting</h2>
            <p className="text-sm text-muted-foreground">{guide.troubleshooting}</p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Connector guides</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Integration guides for GitHub, Stripe, Plaid, and more. OAuth flows and webhook setup.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {connectors.map((c) => (
          <Link key={c?.id ?? ""} to={`/docs/connectors/${c?.id ?? ""}`}>
            <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer">
              <CardHeader>
                <h2 className="text-lg font-medium text-foreground">{c?.title ?? ""}</h2>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {(c?.prerequisites ?? []).length} prerequisites, {(c?.steps ?? []).length} steps
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {connectors.length === 0 && (
        <p className="text-sm text-muted-foreground">No connector guides available.</p>
      )}
    </div>
  );
}
