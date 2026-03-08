/**
 * About & Help API layer.
 * Mock data for now; ready for GET /about-help/docs, /faqs, POST /support/tickets, GET /support/tickets, GET /onboarding/steps, GET /community/channels.
 */

import type {
  AboutHeaderData,
  Doc,
  FAQ,
  Ticket,
  OnboardingStep,
  Channel,
  SearchResult,
  VersionHistoryItem,
} from "@/types/about-help";

const aboutHeader: AboutHeaderData = {
  version: "1.0.0",
  company: "LifeOps",
  mission:
    "LifeOps is a multi-agent AI operating system for teams who want to automate projects, content, finance, and health with safe, auditable workflows and human-in-the-loop controls.",
  privacyUrl: "/privacy-policy",
  termsUrl: "/terms",
};

const docs: Doc[] = [
  {
    id: "1",
    title: "Getting started",
    description: "Set up your workspace, connect integrations, and run your first automation.",
    url: "/docs#overview",
    type: "guide",
    tag: ["onboarding"],
  },
  {
    id: "2",
    title: "API reference",
    description: "REST and GraphQL APIs for cronjobs, runs, approvals, and agent templates.",
    url: "/docs#api",
    type: "api",
    tag: ["developers"],
  },
  {
    id: "3",
    title: "Connector guides",
    description: "Integration guides for GitHub, Stripe, Plaid, QuickBooks, and Health APIs.",
    url: "/docs#connectors",
    type: "guide",
    tag: ["integrations"],
  },
  {
    id: "4",
    title: "Agent template catalog",
    description: "Pre-built agent personas for PR triage, content drafting, and habit coaching.",
    url: "/docs#agent-templates",
    type: "reference",
    tag: ["agents"],
  },
  {
    id: "5",
    title: "Workflow schema",
    description: "Cronjob object model, schedule builder, trigger types, and retry policies.",
    url: "/docs#cronjobs",
    type: "reference",
    tag: ["developers"],
  },
];

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I create my first cronjob?",
    answer:
      "Go to Dashboard → Cronjobs → New. Choose a trigger (schedule or webhook), define inputs, and select an agent template. Save and enable the cronjob.",
    tags: ["cronjobs", "getting-started"],
  },
  {
    id: "2",
    question: "How is billing calculated?",
    answer:
      "Billing is based on run minutes and agent invocations. Check Settings → Billing for usage and limits.",
    tags: ["billing", "account"],
  },
  {
    id: "3",
    question: "Can I connect my own calendar for health plans?",
    answer:
      "Yes. In Health → Training & Meal Planner, use Sync to calendar to push sessions and reminders to Google Calendar or Outlook.",
    tags: ["health", "integrations"],
  },
  {
    id: "4",
    question: "Where are audit logs stored?",
    answer:
      "Audit logs are available under Settings → Data & security. Export is supported for compliance.",
    tags: ["security", "settings"],
  },
  {
    id: "5",
    question: "How do I get support?",
    answer:
      "Use the Contact support form on this page or email support@lifeops.io. We respond within 24 hours.",
    tags: ["support"],
  },
];

const tickets: Ticket[] = [
  {
    id: "t1",
    subject: "API rate limit increase",
    status: "open",
    updatedAt: "2025-03-01T12:00:00Z",
    priority: "medium",
  },
  {
    id: "t2",
    subject: "Health dashboard sync",
    status: "resolved",
    updatedAt: "2025-02-28T09:00:00Z",
    priority: "low",
  },
];

const onboardingSteps: OnboardingStep[] = [
  { id: "1", title: "Create an account", description: "Sign up and verify your email.", completed: true, link: "/auth" },
  { id: "2", title: "Connect first integration", description: "Link GitHub, Stripe, or another connector.", completed: true, link: "/dashboard/settings" },
  { id: "3", title: "Run your first cronjob", description: "Create and run a simple scheduled task.", completed: false, link: "/dashboard/cronjobs" },
  { id: "4", title: "Explore Health module", description: "Set up habits or a training plan.", completed: false, link: "/dashboard/health" },
  { id: "5", title: "Invite a team member", description: "Add collaborators and set permissions.", completed: false, link: "/dashboard/settings" },
];

const channels: Channel[] = [
  { id: "1", name: "Discord", url: "https://discord.gg/lifeops", emoji: "💬", description: "Community chat and support." },
  { id: "2", name: "GitHub Discussions", url: "https://github.com/lifeops/discussions", emoji: "🐙", description: "Feature requests and bug reports." },
  { id: "3", name: "Forum", url: "https://forum.lifeops.io", emoji: "📋", description: "Guides and best practices." },
];

const versionHistory: VersionHistoryItem[] = [
  { version: "1.0.0", date: "2025-03-01", notes: "Initial release. Health dashboard, habits, training & meal planner." },
  { version: "0.9.0", date: "2025-02-15", notes: "Beta: Finance module, forecasting, approvals." },
];

/** Normalize API list response; use when integrating real backend. */
function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export async function getAboutHeader(): Promise<AboutHeaderData> {
  return Promise.resolve(aboutHeader);
}

export async function getDocs(): Promise<Doc[]> {
  return Promise.resolve(asArray(docs));
}

export async function getFaqs(): Promise<FAQ[]> {
  return Promise.resolve(asArray(faqs));
}

export async function getTickets(): Promise<Ticket[]> {
  return Promise.resolve(asArray(tickets));
}

export async function getOnboardingSteps(): Promise<OnboardingStep[]> {
  return Promise.resolve(asArray(onboardingSteps));
}

export async function getChannels(): Promise<Channel[]> {
  return Promise.resolve(asArray(channels));
}

export async function getVersionHistory(): Promise<VersionHistoryItem[]> {
  return Promise.resolve(asArray(versionHistory));
}

/** Global search across docs and FAQs; returns results for dropdown. */
export function searchDocsAndFaqs(query: string, docsList: Doc[], faqsList: FAQ[]): SearchResult[] {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  const docItems = Array.isArray(docsList) ? docsList : [];
  const faqItems = Array.isArray(faqsList) ? faqsList : [];
  docItems.forEach((d) => {
    if (d.title.toLowerCase().includes(q) || (d.description ?? "").toLowerCase().includes(q)) {
      results.push({
        id: `doc-${d.id}`,
        title: d.title,
        type: "doc",
        snippet: (d.description ?? "").slice(0, 80) + (d.description && d.description.length > 80 ? "…" : ""),
        url: d.url ?? "#",
      });
    }
  });
  faqItems.forEach((f) => {
    if (
      (f.question ?? "").toLowerCase().includes(q) ||
      (f.answer ?? "").toLowerCase().includes(q)
    ) {
      results.push({
        id: `faq-${f.id}`,
        title: f.question ?? "",
        type: "faq",
        snippet: (f.answer ?? "").slice(0, 80) + (f.answer && f.answer.length > 80 ? "…" : ""),
        url: `#faq-${f.id}`,
      });
    }
  });
  return results.slice(0, 8);
}

/** Submit support ticket (mock). Future: POST /support/tickets */
export async function submitTicket(_payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ id: string }> {
  return Promise.resolve({ id: `t-${Date.now()}` });
}

/** Toggle onboarding step completed (mock). Future: PATCH /onboarding/steps/:id */
export async function setOnboardingStepCompleted(
  stepId: string,
  completed: boolean
): Promise<void> {
  const step = onboardingSteps.find((s) => s.id === stepId);
  if (step) step.completed = completed;
  return Promise.resolve();
}
