/**
 * About & Help API layer.
 * Uses mock data for now; structure ready for future backend integration.
 */

import type {
  AboutInfo,
  Doc,
  FAQ,
  Ticket,
  OnboardingStep,
  Channel,
  SearchResult,
  VersionHistory,
} from "@/types/about-help";

const MOCK_ABOUT: AboutInfo = {
  version: "1.0.0",
  company: "LifeOps",
  mission:
    "LifeOps is a multi-agent AI operating system for teams who want to automate projects, content, finance, and health with safe, auditable workflows and human-in-the-loop controls.",
  privacyUrl: "/privacy",
  termsUrl: "/terms",
};

const MOCK_DOCS: Doc[] = [
  {
    id: "d1",
    title: "Getting started",
    description: "Set up your workspace, connect integrations, and run your first agent.",
    url: "/docs#getting-started",
    type: "guide",
    tags: ["onboarding", "setup"],
  },
  {
    id: "d2",
    title: "API reference",
    description: "REST and GraphQL APIs for cronjobs, runs, approvals, and agent templates.",
    url: "/docs#api",
    type: "api",
    tags: ["api", "developers"],
  },
  {
    id: "d3",
    title: "Connector guides",
    description: "Integration guides for GitHub, Stripe, Plaid, and Health APIs.",
    url: "/docs#connectors",
    type: "guide",
    tags: ["integrations", "oauth"],
  },
  {
    id: "d4",
    title: "Agent template catalog",
    description: "Pre-built agent personas for PR triage, content drafting, and habit coaching.",
    url: "/docs#agent-templates",
    type: "reference",
    tags: ["agents", "templates"],
  },
  {
    id: "d5",
    title: "Workflow schema",
    description: "Cronjob object model, schedule builder, trigger types, and retry policies.",
    url: "/docs#workflow",
    type: "reference",
    tags: ["cronjobs", "schema"],
  },
];

const MOCK_FAQS: FAQ[] = [
  {
    id: "f1",
    question: "How do I create my first cronjob?",
    answer:
      "Navigate to Dashboard > Cronjobs > New. Choose a template or start from scratch. Configure the schedule, triggers, and agent assignments. Save and enable the cronjob.",
    tags: ["cronjobs", "getting-started"],
  },
  {
    id: "f2",
    question: "How does the approval flow work?",
    answer:
      "When an agent proposes an action that requires human approval, it appears in the Approvals queue. You can approve, reject, or modify the proposal. Approved actions are logged in the audit trail.",
    tags: ["approvals", "agents"],
  },
  {
    id: "f3",
    question: "Can I connect my own calendar for health sync?",
    answer:
      "Yes. Go to Settings > Integrations and connect Google Calendar or Outlook. Training and meal plans can sync events to your calendar.",
    tags: ["health", "integrations", "calendar"],
  },
  {
    id: "f4",
    question: "How do I export my data?",
    answer:
      "Navigate to Settings > Exports. You can export habits, training plans, transactions, and audit logs. Exports are delivered as JSON or CSV.",
    tags: ["settings", "data", "export"],
  },
  {
    id: "f5",
    question: "What happens if an agent run fails?",
    answer:
      "Failed runs are logged with error details. You can retry from the run details page. Configure retry policies in the cronjob schema.",
    tags: ["cronjobs", "runs", "errors"],
  },
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: "t1",
    subject: "Question about habit reminders",
    status: "resolved",
    updatedAt: "2025-03-01T14:00:00Z",
    priority: "medium",
  },
  {
    id: "t2",
    subject: "API rate limit clarification",
    status: "in_progress",
    updatedAt: "2025-03-07T10:30:00Z",
    priority: "high",
  },
];

const MOCK_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "o1",
    title: "Create your first cronjob",
    description: "Set up a simple scheduled task to understand the workflow.",
    completed: true,
    link: "/dashboard/cronjobs/new",
  },
  {
    id: "o2",
    title: "Connect an integration",
    description: "Link GitHub, Stripe, or another connector to enable agent actions.",
    completed: true,
    link: "/dashboard/settings/integrations",
  },
  {
    id: "o3",
    title: "Review an approval",
    description: "Check the Approvals queue and approve or reject a proposal.",
    completed: false,
    link: "/dashboard/approvals",
  },
  {
    id: "o4",
    title: "Set up health habits",
    description: "Create a habit in the Health module and track your first streak.",
    completed: false,
    link: "/dashboard/health/habits",
  },
];

const MOCK_CHANNELS: Channel[] = [
  {
    id: "c1",
    name: "Discord",
    url: "https://discord.gg/lifeops",
    emoji: "💬",
    description: "Community chat, support, and announcements.",
  },
  {
    id: "c2",
    name: "GitHub Discussions",
    url: "https://github.com/lifeops/discussions",
    emoji: "🐙",
    description: "Feature requests, bug reports, and technical discussions.",
  },
];

const MOCK_VERSION_HISTORY: VersionHistory[] = [
  { version: "1.0.0", date: "2025-03-01", notes: "Initial release with core modules." },
  { version: "0.9.0", date: "2025-02-15", notes: "Beta: Health dashboard, forecasting." },
];

/**
 * Fetch about info. Returns validated data with safe defaults.
 */
export async function fetchAboutInfo(): Promise<AboutInfo> {
  const data = MOCK_ABOUT ?? {};
  return {
    version: data.version ?? "0.0.0",
    company: data.company ?? "LifeOps",
    mission: data.mission ?? "",
    privacyUrl: data.privacyUrl,
    termsUrl: data.termsUrl,
  };
}

/**
 * Fetch documentation list. Returns array; guards against non-array.
 */
export async function fetchDocs(): Promise<Doc[]> {
  const raw = MOCK_DOCS ?? [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Fetch FAQ list. Returns array; guards against non-array.
 */
export async function fetchFAQs(): Promise<FAQ[]> {
  const raw = MOCK_FAQS ?? [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Fetch support tickets. Returns array; guards against non-array.
 */
export async function fetchTickets(): Promise<Ticket[]> {
  const raw = MOCK_TICKETS ?? [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Fetch onboarding steps. Returns array; guards against non-array.
 */
export async function fetchOnboardingSteps(): Promise<OnboardingStep[]> {
  const raw = MOCK_ONBOARDING_STEPS ?? [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Fetch community channels. Returns array; guards against non-array.
 */
export async function fetchChannels(): Promise<Channel[]> {
  const raw = MOCK_CHANNELS ?? [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Fetch version history. Returns array; guards against non-array.
 */
export async function fetchVersionHistory(): Promise<VersionHistory[]> {
  const raw = MOCK_VERSION_HISTORY ?? [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Search across docs and FAQs. Returns array; guards against non-array.
 */
export function searchAboutHelp(query: string): SearchResult[] {
  const q = (query ?? "").toLowerCase().trim();
  if (!q) return [];

  const docs = MOCK_DOCS ?? [];
  const faqs = MOCK_FAQS ?? [];
  const results: SearchResult[] = [];

  (Array.isArray(docs) ? docs : []).forEach((d) => {
    const match =
      (d.title ?? "").toLowerCase().includes(q) ||
      (d.description ?? "").toLowerCase().includes(q) ||
      ((d.tags ?? []) as string[]).some((t) => t.toLowerCase().includes(q));
    if (match) {
      results.push({
        id: d.id,
        title: d.title ?? "",
        type: "doc",
        snippet: d.description ?? "",
        url: d.url ?? "#",
      });
    }
  });

  (Array.isArray(faqs) ? faqs : []).forEach((f) => {
    const match =
      (f.question ?? "").toLowerCase().includes(q) ||
      (f.answer ?? "").toLowerCase().includes(q) ||
      ((f.tags ?? []) as string[]).some((t) => t.toLowerCase().includes(q));
    if (match) {
      results.push({
        id: f.id,
        title: f.question ?? "",
        type: "faq",
        snippet: (f.answer ?? "").slice(0, 100) + "...",
        url: `#faq-${f.id}`,
      });
    }
  });

  return results;
}

/**
 * Submit support ticket. Placeholder for future API.
 */
export async function submitTicket(_payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ id: string }> {
  return { id: `t-${Date.now()}` };
}
