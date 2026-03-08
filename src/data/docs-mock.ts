/**
 * Mock data for Documentation / Developer Docs.
 * Used when no backend is available; all arrays guarded on consumption.
 */

import type {
  APIDocSection,
  ConnectorGuide,
  AgentTemplate,
  WorkflowSchema,
  DocsLandingData,
} from "@/types/docs";

export const mockApiSections: APIDocSection[] = [
  {
    id: "cronjobs",
    title: "Cronjobs",
    description: "Schedule, trigger, and manage automation runs.",
    endpoints: [
      {
        id: "list-cronjobs",
        method: "GET",
        path: "/api/cronjobs",
        description: "List all cronjobs for the authenticated user.",
        params: [
          { name: "page", in: "query", required: false, type: "number", description: "Page number" },
          { name: "limit", in: "query", required: false, type: "number", description: "Items per page" },
        ],
        responses: [
          { code: 200, contentType: "application/json", schema: "Cronjob[]" },
          { code: 401, contentType: "application/json", schema: "Error" },
        ],
        examples: [
          {
            lang: "curl",
            label: "cURL",
            code: "curl -X GET 'https://api.lifeops.io/api/cronjobs' -H 'Authorization: Bearer <token>'",
          },
          {
            lang: "javascript",
            label: "fetch",
            code: `const res = await fetch('/api/cronjobs', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const data = await res.json();`,
          },
        ],
        status: "stable",
      },
      {
        id: "create-cronjob",
        method: "POST",
        path: "/api/cronjobs",
        description: "Create a new cronjob.",
        params: [
          { name: "body", in: "body", required: true, type: "object", description: "Cronjob payload" },
        ],
        responses: [
          { code: 201, contentType: "application/json", schema: "Cronjob" },
          { code: 400, contentType: "application/json", schema: "ValidationError" },
        ],
        examples: [
          {
            lang: "json",
            label: "Request body",
            code: '{"name":"Daily sync","schedule":"0 9 * * *","payload":{}}',
          },
        ],
        status: "stable",
      },
    ],
  },
  {
    id: "agents",
    title: "Agents",
    description: "Agent templates and run artifacts.",
    endpoints: [
      {
        id: "list-agents",
        method: "GET",
        path: "/api/agents",
        description: "List available agent templates.",
        params: [],
        responses: [{ code: 200, contentType: "application/json", schema: "AgentTemplate[]" }],
        examples: [],
        status: "stable",
      },
      {
        id: "run-artifacts",
        method: "GET",
        path: "/api/runs/:runId/artifacts",
        description: "Get artifacts for a run.",
        params: [
          { name: "runId", in: "path", required: true, type: "string", description: "Run ID" },
        ],
        responses: [{ code: 200, contentType: "application/json", schema: "Artifact[]" }],
        examples: [],
        status: "stable",
      },
    ],
  },
];

export const mockConnectorGuides: ConnectorGuide[] = [
  {
    id: "github",
    title: "GitHub",
    prerequisites: ["GitHub account", "Personal access token or OAuth app"],
    steps: [
      { order: 1, title: "Create OAuth App", body: "In GitHub Settings > Developer settings, create a new OAuth App. Set callback URL to your LifeOps redirect URI." },
      { order: 2, title: "Add credentials", body: "In LifeOps Settings > Integrations, add your Client ID and Client Secret." },
      { order: 3, title: "Authorize", body: "Click Connect and complete the GitHub authorization flow." },
    ],
    permissions: [
      { scope: "repo", description: "Full control of private repositories", required: true },
      { scope: "read:user", description: "Read user profile", required: true },
    ],
    troubleshooting: "If webhooks fail, ensure the app has repo admin and webhook permissions.",
  },
  {
    id: "stripe",
    title: "Stripe",
    prerequisites: ["Stripe account", "API keys"],
    steps: [
      { order: 1, title: "Get API keys", body: "From Stripe Dashboard > Developers > API keys, copy Secret key and Publishable key." },
      { order: 2, title: "Configure webhook", body: "Add endpoint URL and select events: payment_intent.succeeded, customer.subscription.updated." },
      { order: 3, title: "Connect in LifeOps", body: "Paste keys in Settings > Integrations > Stripe and verify connection." },
    ],
    permissions: [
      { scope: "read:customers", description: "Read customer data", required: true },
      { scope: "read:subscriptions", description: "Read subscriptions", required: true },
    ],
  },
];

export const mockAgentTemplates: AgentTemplate[] = [
  { id: "pr-triage", name: "PR Triage", category: "Engineering", language: "TypeScript", version: "1.2.0", description: "Triages pull requests and suggests reviewers.", preview: "Summarizes PRs and assigns labels." },
  { id: "content-draft", name: "Content Draft", category: "Content", language: "TypeScript", version: "2.0.0", description: "Drafts blog posts and social copy from outlines.", preview: "Generates first draft from bullet points." },
  { id: "habit-coach", name: "Habit Coach", category: "Health", language: "TypeScript", version: "1.0.0", description: "Sends reminders and tracks habit streaks.", preview: "Daily check-ins and streak tracking." },
  { id: "tx-categorize", name: "Transaction Categorizer", category: "Finance", language: "TypeScript", version: "1.1.0", description: "Categorizes transactions and suggests rules.", preview: "Auto-categorize from merchant and amount." },
];

export const mockWorkflowSchema: WorkflowSchema = {
  id: "workflow-v1",
  name: "Workflow",
  fields: [
    { name: "id", type: "string", required: true, description: "Unique workflow ID" },
    { name: "name", type: "string", required: true, description: "Display name" },
    { name: "trigger", type: "object", required: true, description: "Trigger configuration", children: [
      { name: "type", type: "string", required: true, description: "cron | webhook | manual" },
      { name: "schedule", type: "string", required: false, description: "Cron expression when type is cron" },
    ]},
    { name: "steps", type: "array", required: true, description: "Execution steps", children: [
      { name: "id", type: "string", required: true, description: "Step ID" },
      { name: "agent", type: "string", required: true, description: "Agent template ID" },
      { name: "input", type: "object", required: false, description: "Step input mapping" },
    ]},
  ],
  relationships: ["AgentTemplate", "Run"],
};

export const mockDocsLanding: DocsLandingData = {
  features: [
    { id: "api", title: "API Reference", description: "REST APIs for cronjobs, agents, and run artifacts." },
    { id: "connectors", title: "Connectors", description: "GitHub, Stripe, Plaid, and more with setup guides." },
    { id: "templates", title: "Agent Templates", description: "Pre-built agents for PR triage, content, health, finance." },
    { id: "schema", title: "Workflow Schema", description: "Schema reference and validation rules." },
  ],
  pricing: [
    { id: "starter", name: "Starter", price: "$29/mo", features: ["5 cronjobs", "3 agents", "Community support"] },
    { id: "pro", name: "Pro", price: "$99/mo", features: ["Unlimited cronjobs", "All agents", "Priority support"] },
    { id: "enterprise", name: "Enterprise", price: "Custom", features: ["SSO", "Audit logs", "Dedicated support"] },
  ],
  testimonials: [
    { id: "1", author: "Jane Doe", company: "Acme Inc", text: "LifeOps cut our release triage time in half.", rating: 5 },
    { id: "2", author: "John Smith", company: "Startup Co", text: "The agent templates got us live in a day.", rating: 5 },
    { id: "3", author: "Alex Chen", company: "DevOps Team", text: "Best developer docs we have used.", rating: 5 },
  ],
};
