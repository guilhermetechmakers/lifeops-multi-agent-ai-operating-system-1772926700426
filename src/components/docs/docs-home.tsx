import { Link } from "react-router-dom";
import { Code2, Plug, Bot, GitBranch } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { CTAPanel } from "./cta-panel";
import { AuditTrailMock } from "./audit-trail-mock";
import { cn } from "@/lib/utils";

const sections = [
  { id: "api", title: "API Reference", description: "REST endpoints for cronjobs, agents, and run artifacts.", to: "/docs/api", icon: Code2 },
  { id: "connectors", title: "Connectors", description: "Setup guides for GitHub, Stripe, Plaid, and more.", to: "/docs/connectors", icon: Plug },
  { id: "templates", title: "Agent Templates", description: "Pre-built agents for triage, content, health, finance.", to: "/docs/templates", icon: Bot },
  { id: "workflow", title: "Workflow Schema", description: "Schema reference and validation rules.", to: "/docs/workflow-schema", icon: GitBranch },
];

export function DocsHome() {
  return (
    <div className="space-y-10 p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Developer documentation
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          API reference, connector guides, agent template catalog, and workflow schema for the LifeOps multi-agent AI operating system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(sections ?? []).map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.id} to={s.to}>
              <Card
                className={cn(
                  "h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer border-white/[0.03]"
                )}
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{s.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <section aria-label="Call to action">
        <CTAPanel
          title="Ready to build?"
          description="Create an account or book a demo to get started with LifeOps."
          primaryLabel="Sign up"
          primaryHref="/signup"
          secondaryLabel="Book demo"
          secondaryHref="#book-demo"
        />
      </section>

      <section aria-label="Audit trail demo">
        <AuditTrailMock
          entries={[
            { id: "1", action: "Schedule updated", timestamp: "2024-01-15T10:00:00Z", artifactRef: "run_abc123" },
            { id: "2", action: "Approval granted", timestamp: "2024-01-15T09:30:00Z" },
          ]}
        />
      </section>
    </div>
  );
}
