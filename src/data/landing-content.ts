import type { SectionContent } from "@/types/landing";

export const defaultLandingContent: SectionContent = {
  hero: {
    title: "The multi-agent AI operating system",
    subtitle:
      "Automate projects, content, finance, and health with coordinated GPT-powered agents. Safe, auditable, and human-in-the-loop by default.",
    ctas: [
      { label: "Create account", href: "/signup" },
      { label: "Book demo", href: "#book-demo" },
    ],
  },
  features: [
    {
      id: "projects",
      icon: "folder-kanban",
      title: "Projects",
      description:
        "Developer-centric project hub with roadmap, ticket board, PR summaries, CI status, and agent suggestions for automated triage.",
      cta: { label: "Learn more", href: "/docs#projects" },
    },
    {
      id: "content",
      icon: "file-text",
      title: "Content",
      description:
        "Content pipeline with calendar, drafts, publishing queue, SEO insights, and LLM-assisted authoring with versioning.",
      cta: { label: "Learn more", href: "/docs#content" },
    },
    {
      id: "finance",
      icon: "credit-card",
      title: "Finance",
      description:
        "Financial oversight with transaction feed, subscriptions panel, anomaly alerts, and automated reconciliation.",
      cta: { label: "Learn more", href: "/docs#finance" },
    },
    {
      id: "health",
      icon: "heart",
      title: "Health",
      description:
        "Personal health overview with habits panel, training and meal plans, and workload balancer for recovery optimization.",
      cta: { label: "Learn more", href: "/docs#health" },
    },
    {
      id: "cronjobs",
      icon: "clock",
      title: "Cronjobs & Orchestration",
      description:
        "Schedule, trigger, and monitor automations with full run artifacts, audit trails, and human-in-the-loop approvals.",
      cta: { label: "Learn more", href: "/docs#cronjobs" },
    },
  ],
  howItWorks: [
    {
      title: "Agents",
      description:
        "GPT-powered agents negotiate, handoff, and execute workflows with traceable messaging and scoped memory.",
      icon: "bot",
    },
    {
      title: "Cronjobs",
      description:
        "Schedule automations as first-class objects with triggers, constraints, safety rails, and retry policies.",
      icon: "clock",
    },
    {
      title: "Approvals",
      description:
        "Human-in-the-loop governance: suggest-only, approval-required, or bounded autopilot. You stay in control.",
      icon: "shield-check",
    },
  ],
  pricing: [
    {
      id: "starter",
      name: "Starter",
      price: "$29/mo",
      features: [
        "Up to 5 cronjobs",
        "Projects & Content modules",
        "Basic agent templates",
        "Email support",
      ],
      ctaLabel: "Get started",
    },
    {
      id: "pro",
      name: "Pro",
      price: "$99/mo",
      features: [
        "Unlimited cronjobs",
        "All modules (Projects, Content, Finance, Health)",
        "Advanced agent templates",
        "Priority support",
        "API access",
      ],
      ctaLabel: "Start free trial",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "SSO & RBAC",
        "Dedicated support",
        "Compliance exports",
        "VPC / on-prem options",
      ],
      ctaLabel: "Contact sales",
    },
  ],
  testimonials: [
    {
      id: "1",
      quote:
        "LifeOps transformed how we handle PR triage. The agent suggestions are accurate and the approval workflow keeps us in control.",
      author: "Sarah Chen",
      role: "Engineering Lead, ScaleUp",
    },
    {
      id: "2",
      quote:
        "Finally, a platform that combines project automation with finance and health. The workload balancer alone is worth it.",
      author: "Marcus Webb",
      role: "Solo Founder",
    },
    {
      id: "3",
      quote:
        "The audit trail and reversibility gave our compliance team confidence to enable bounded autopilot. Game changer.",
      author: "Elena Rodriguez",
      role: "CTO, FinTech Co",
    },
  ],
  integrations: [
    "GitHub",
    "Stripe",
    "Plaid",
    "Google",
    "QuickBooks",
    "Health APIs",
  ],
};
