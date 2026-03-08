import { Link } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import {
  BookOpen,
  Code2,
  Plug,
  Bot,
  FileText,
  CreditCard,
  Heart,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const docSections = [
  {
    id: "overview",
    title: "Overview",
    description:
      "LifeOps is a multi-agent AI operating system. Agents coordinate via an orchestration layer with traceable messaging, scoped memory, and conflict resolution.",
    icon: BookOpen,
  },
  {
    id: "api",
    title: "API Reference",
    description:
      "REST and GraphQL APIs for cronjobs, runs, approvals, and agent templates. All endpoints require authentication.",
    icon: Code2,
  },
  {
    id: "connectors",
    title: "Connector Guides",
    description:
      "Integration guides for GitHub, Stripe, Plaid, QuickBooks, Xero, and Health APIs. OAuth flows and webhook setup.",
    icon: Plug,
  },
  {
    id: "agent-templates",
    title: "Agent Template Catalog",
    description:
      "Pre-built agent personas for PR triage, content drafting, transaction categorization, and habit coaching.",
    icon: Bot,
  },
  {
    id: "projects",
    title: "Projects Module",
    description:
      "Developer-centric project hub with roadmap, ticket board, PR summaries, and CI status. Agent suggestions for triage.",
    icon: FileText,
  },
  {
    id: "content",
    title: "Content Module",
    description:
      "Content pipeline with calendar, drafts, publishing queue, and LLM-assisted authoring with versioning.",
    icon: FileText,
  },
  {
    id: "finance",
    title: "Finance Module",
    description:
      "Transaction ingestion, categorization rules, anomaly detection, and forecasting. Plaid and accounting adapters.",
    icon: CreditCard,
  },
  {
    id: "health",
    title: "Health Module",
    description:
      "Habit tracking, recovery scores, training and meal plan generator. HealthKit and Google Fit connectors.",
    icon: Heart,
  },
  {
    id: "cronjobs",
    title: "Cronjobs & Workflow Schema",
    description:
      "Cronjob object model, schedule builder, trigger types, constraints, safety rails, and retry policies.",
    icon: Clock,
  },
];

const aboutSection = {
  id: "about",
  title: "About LifeOps",
  description:
    "LifeOps is a multi-agent AI operating system for teams who want to automate projects, content, finance, and health with safe, auditable workflows and human-in-the-loop controls.",
  icon: BookOpen,
};

const contactSection = {
  id: "contact",
  title: "Contact",
  description:
    "Get in touch for sales, support, or partnerships. We respond within 24 hours.",
  icon: BookOpen,
};

const helpSection = {
  id: "help",
  title: "Help",
  description:
    "Documentation, guides, and troubleshooting. Check the API reference and connector guides for implementation details.",
  icon: BookOpen,
};

export default function Docs() {
  return (
    <AnimatedPage className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#111213] to-[#1A1A1B] opacity-90" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-4">
            <Link
              to="/"
              className="text-xl font-semibold text-foreground hover:text-foreground/90"
            >
              LifeOps
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <span className="text-sm text-muted-foreground hover:text-foreground">
                  Sign in
                </span>
              </Link>
              <Link to="/signup">
                <span className="text-sm font-medium text-primary hover:text-primary/90">
                  Create account
                </span>
              </Link>
            </div>
          </nav>

          <header className="py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Developer Documentation
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              API reference, connector guides, agent template catalog, and
              workflow schema for the LifeOps multi-agent AI operating system.
            </p>
          </header>

          <main className="py-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {[aboutSection, helpSection, ...docSections, contactSection].map((section, index) => {
                const Icon = section.icon;
                return (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${section.id}-title`}
                    className={cn(
                      "rounded-lg border border-white/[0.03] bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
                      "animate-fade-in-up"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" aria-hidden />
                      </div>
                      <div>
                        <h2
                          id={`${section.id}-title`}
                          className="font-semibold text-foreground"
                        >
                          {section.title}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </main>

          <footer className="mt-16 py-8 border-t border-white/[0.03]">
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Home
              </Link>
              <Link
                to="/docs#about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
              <Link
                to="/docs#contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </AnimatedPage>
  );
}
