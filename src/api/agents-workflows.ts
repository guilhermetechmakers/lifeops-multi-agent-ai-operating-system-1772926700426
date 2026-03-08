/**
 * Agents and Workflow Templates API - for TargetPicker.
 * Wired for future API hooks; uses mock data when no backend.
 */

import { api } from "@/lib/api";

export interface AgentTarget {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

export interface WorkflowTarget {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CRONJOBS === "true";

const MOCK_AGENTS: AgentTarget[] = [
  { id: "tpl-dev-triage", name: "PR Triage Agent", description: "Triages pull requests", status: "active" },
  { id: "content-publisher", name: "Content Publisher", description: "Publishes content", status: "active" },
  { id: "finance-analyzer", name: "Finance Analyzer", description: "Analyzes financial data", status: "active" },
  { id: "health-monitor", name: "Health Monitor", description: "Monitors system health", status: "active" },
];

const MOCK_WORKFLOWS: WorkflowTarget[] = [
  { id: "digest-wf", name: "Daily Digest Workflow", description: "Generates daily digest", status: "active" },
  { id: "finance-close", name: "Finance Close Workflow", description: "Monthly close process", status: "active" },
  { id: "content-review-wf", name: "Content Review Workflow", description: "Content review pipeline", status: "active" },
];

export async function fetchAgents(search?: string): Promise<AgentTarget[]> {
  if (USE_MOCK) {
    const list = MOCK_AGENTS ?? [];
    if (!search?.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q)
    );
  }
  const response = await api.get<AgentTarget[] | { data: AgentTarget[] }>(
    `agents?search=${encodeURIComponent(search ?? "")}`
  );
  const data = Array.isArray(response) ? response : (response as { data?: AgentTarget[] })?.data;
  return Array.isArray(data) ? data : [];
}

export async function fetchWorkflows(search?: string): Promise<WorkflowTarget[]> {
  if (USE_MOCK) {
    const list = MOCK_WORKFLOWS ?? [];
    if (!search?.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        (w.description ?? "").toLowerCase().includes(q)
    );
  }
  const response = await api.get<WorkflowTarget[] | { data: WorkflowTarget[] }>(
    `workflows/templates?search=${encodeURIComponent(search ?? "")}`
  );
  const data = Array.isArray(response) ? response : (response as { data?: WorkflowTarget[] })?.data;
  return Array.isArray(data) ? data : [];
}
