/**
 * Mock documentation data for LifeOps Developer Docs.
 * Used when no backend API is available. All arrays guarded at consumption.
 */

import type {
  APIDocSection,
  ConnectorGuide,
  AgentTemplate,
  WorkflowSchema,
  PricingPlan,
  Testimonial,
} from "@/types/docs";

export const apiDocSections: APIDocSection[] = [
  {
    id: "cronjobs",
    title: "Cronjobs",
    description: "Schedule, trigger, and monitor automations.",
    endpoints: [
      {
        id: "list-cronjobs",
        method: "GET",
        path: "/api/v1/cronjobs",
        description: "List all cronjobs for the authenticated organization.",
        params: [
          { name: "page", in: "query", required: false, type: "integer", description: "Page number" },
          { name: "limit", in: "query", required: false, type: "integer", description: "Items per page" },
        ],
        responses: [{ code: 200, contentType: "application/json", schema: "CronjobList" }],
        examples: [
          {
            language: "curl",
            label: "cURL",
            code: `curl -X GET "https://api.lifeops.io/api/v1/cronjobs" \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
          },
          {
            language: "javascript",
            label: "fetch",
            code: `const res = await fetch("https://api.lifeops.io/api/v1/cronjobs", {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
const data = await res.json();`,
          },
        ],
      },
      {
        id: "create-cronjob",
        method: "POST",
        path: "/api/v1/cronjobs",
        description: "Create a new cronjob.",
        params: [
          { name: "body", in: "body", required: true, type: "object", description: "Cronjob payload" },
        ],
        responses: [{ code: 201, contentType: "application/json", schema: "Cronjob" }],
        examples: [
          {
            language: "curl",
            label: "cURL",
            code: `curl -X POST "https://api.lifeops.io/api/v1/cronjobs" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"schedule":"0 9 * * *","agentId":"pr-triage"}'`,
          },
        ],
      },
    ],
  },
  {
    id: "agents",
    title: "Agents",
    description: "Agent templates and run management.",
    endpoints: [
      {
        id: "list-agents",
        method: "GET",
        path: "/api/v1/agents",
        description: "List available agent templates.",
        params: [],
        responses: [{ code: 200, contentType: "application/json", schema: "AgentList" }],
        examples: [
          {
            language: "curl",
            label: "cURL",
            code: `curl -X GET "https://api.lifeops.io/api/v1/agents" \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
          },
        ],
      },
    ],
  },
  {
    id: "run-artifacts",
    title: "Run Artifacts",
    description: "Retrieve run logs and artifacts.",
    endpoints: [
      {
        id: "get-run",
        method: "GET",
        path: "/api/v1/runs/:runId",
        description: "Get run details and artifacts.",
        params: [
          { name: "runId", in: "path", required: true, type: "string", description: "Run ID" },
        ],
        responses: [{ code: 200, contentType: "application/json", schema: "Run" }],
        examples: [
          {
            language: "curl",
            label: "cURL",
            code: `curl -X GET "https://api.lifeops.io/api/v1/runs/run_abc123" \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
          },
        ],
      },
    ],
  },
];

export const connectorGuides: ConnectorGuide[] = [
  {
    id: "github",
    title: "GitHub",
    prerequisites: ["GitHub account", "Organization admin access"],
    steps: [
      { number: 1, title: "Create OAuth App", description: "In GitHub Settings > Developer settings, create a new OAuth App. Set callback URL to your LifeOps redirect URI." },
      { number: 2, title: "Add credentials", description: "In LifeOps Settings > Integrations, add your GitHub Client ID and Client Secret." },
      { number: 3, title: "Connect repository", description: "Authorize LifeOps to access the repositories you want to automate." },
    ],
    permissions: [
      { scope: "repo", description: "Full control of private repositories", required: true },
      { scope: "read:org", description: "Read org membership", required: false },
    ],
  },
  {
    id: "stripe",
    title: "Stripe",
    prerequisites: ["Stripe account", "API keys"],
    steps: [
      { number: 1, title: "Get API keys", description: "From Stripe Dashboard > Developers > API keys, copy your Secret key." },
      { number: 2, title: "Configure webhook", description: "Create a webhook endpoint pointing to LifeOps. Subscribe to payment_intent.succeeded and charge.succeeded." },
      { number: 3, title: "Add to LifeOps", description: "In LifeOps Settings > Integrations, paste your Secret key and webhook signing secret." },
    ],
    permissions: [
      { scope: "read", description: "Read access to Stripe data", required: true },
    ],
  },
  {
    id: "plaid",
    title: "Plaid",
    prerequisites: ["Plaid account", "Sandbox or Production keys"],
    steps: [
      { number: 1, title: "Register app", description: "Create an application in Plaid Dashboard and obtain client_id and secret." },
      { number: 2, title: "Configure Link", description: "Set redirect URI and webhook URL for Plaid Link flow." },
      { number: 3, title: "Connect in LifeOps", description: "Add Plaid credentials in LifeOps Finance settings. Users will link accounts via Plaid Link." },
    ],
    permissions: [
      { scope: "transactions", description: "Read transaction history", required: true },
      { scope: "accounts", description: "Read account details", required: true },
    ],
  },
];

export const agentTemplates: AgentTemplate[] = [
  { id: "pr-triage", name: "PR Triage", category: "Engineering", language: "TypeScript", version: "1.2.0", description: "Analyzes pull requests and suggests labels, reviewers, and merge readiness.", preview: "Suggests labels based on changed files and description." },
  { id: "content-draft", name: "Content Draft", category: "Content", language: "TypeScript", version: "1.0.0", description: "Generates blog posts and social copy from outlines.", preview: "Uses GPT to expand outlines into full drafts." },
  { id: "tx-categorize", name: "Transaction Categorizer", category: "Finance", language: "TypeScript", version: "1.1.0", description: "Categorizes transactions using rules and ML.", preview: "Matches transactions to categories with confidence scores." },
  { id: "habit-coach", name: "Habit Coach", category: "Health", language: "TypeScript", version: "1.0.0", description: "Sends habit reminders and coaching interventions.", preview: "Tracks streaks and suggests adjustments." },
  { id: "approval-router", name: "Approval Router", category: "Governance", language: "TypeScript", version: "1.0.0", description: "Routes approval requests to the right stakeholders.", preview: "Uses org structure to find approvers." },
];

export const workflowSchemas: WorkflowSchema[] = [
  {
    id: "cronjob",
    name: "Cronjob",
    fields: [
      { name: "id", type: "string", required: true, description: "Unique identifier" },
      { name: "schedule", type: "string", required: true, description: "Cron expression (e.g. 0 9 * * *)" },
      { name: "agentId", type: "string", required: true, description: "Agent template ID" },
      { name: "config", type: "object", required: false, description: "Agent-specific config", fields: [
        { name: "inputs", type: "object", required: false, description: "Input parameters" },
      ]},
      { name: "enabled", type: "boolean", required: false, description: "Whether cronjob is active" },
    ],
    relationships: ["agent", "runs"],
  },
  {
    id: "run",
    name: "Run",
    fields: [
      { name: "id", type: "string", required: true, description: "Run ID" },
      { name: "cronjobId", type: "string", required: true, description: "Parent cronjob" },
      { name: "status", type: "enum", required: true, description: "pending | running | success | failed" },
      { name: "startedAt", type: "string", required: true, description: "ISO timestamp" },
      { name: "finishedAt", type: "string", required: false, description: "ISO timestamp" },
      { name: "artifacts", type: "array", required: false, description: "Output artifacts" },
    ],
    relationships: ["cronjob", "artifacts"],
  },
];

export const pricingPlans: PricingPlan[] = [
  { id: "starter", name: "Starter", price: "$29/mo", features: ["Up to 5 cronjobs", "Projects & Content", "Basic templates", "Email support"] },
  { id: "pro", name: "Pro", price: "$99/mo", features: ["Unlimited cronjobs", "All modules", "Advanced templates", "Priority support", "API access"] },
  { id: "enterprise", name: "Enterprise", price: "Custom", features: ["Everything in Pro", "SSO & RBAC", "Dedicated support", "Compliance exports"] },
];

export const docsTestimonials: Testimonial[] = [
  { id: "1", author: "Sarah Chen", company: "ScaleUp", text: "LifeOps transformed how we handle PR triage. The agent suggestions are accurate and the approval workflow keeps us in control.", rating: 5 },
  { id: "2", author: "Marcus Webb", company: "Solo Founder", text: "Finally, a platform that combines project automation with finance and health. The workload balancer alone is worth it.", rating: 5 },
  { id: "3", author: "Elena Rodriguez", company: "FinTech Co", text: "The audit trail and reversibility gave our compliance team confidence to enable bounded autopilot. Game changer.", rating: 5 },
];
