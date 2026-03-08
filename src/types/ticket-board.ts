/**
 * Ticket Board data models.
 * Use (data ?? []) and Array.isArray when consuming API responses.
 */

import type { Ticket, TicketStatus } from "@/types/projects";

export type { Ticket, TicketStatus };

export interface Column {
  id: string;
  projectId: string;
  name: string;
  order: number;
  archived?: boolean;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  state?: string;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: unknown;
}

export interface RuleAction {
  type: string;
  payload?: Record<string, unknown>;
}

export interface Rule {
  id: string;
  projectId: string;
  name: string;
  conditions?: RuleCondition[];
  actions?: RuleAction[];
  enabled?: boolean;
  createdAt?: string;
}

export interface Run {
  id: string;
  ruleOrAgentId: string;
  status: string;
  logs?: string[];
  artifacts?: string[];
  startedAt?: string;
  finishedAt?: string;
}

export interface Artifact {
  id: string;
  runId: string;
  type: string;
  contentRef: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface BoardFilters {
  assigneeIds?: string[];
  labels?: string[];
  priority?: string[];
  status?: string[];
  sprintId?: string;
  search?: string;
}

export interface BoardState {
  columns: Column[];
  ticketsByColumn: Record<string, Ticket[]>;
  selectedTicketIds: string[];
  isBulkEditing: boolean;
  activeSprintId: string | null;
  filters: BoardFilters;
}
