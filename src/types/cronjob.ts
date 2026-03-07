export type AutomationLevel = "suggest-only" | "approval-required" | "bounded-autopilot";
export type TriggerType = "schedule" | "event" | "manual";

export interface RetryPolicy {
  max_retries: number;
  backoff_ms: number;
  backoff_multiplier?: number;
}

export interface Cronjob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  timezone: string;
  trigger: TriggerType;
  target_agent_id: string;
  input_template: Record<string, unknown>;
  automation_level: AutomationLevel;
  constraints?: string[];
  safety_rails?: string[];
  retry_policy?: RetryPolicy;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCronjobInput {
  name: string;
  enabled?: boolean;
  schedule: string;
  timezone: string;
  trigger: TriggerType;
  target_agent_id: string;
  input_template?: Record<string, unknown>;
  automation_level?: AutomationLevel;
  constraints?: string[];
  safety_rails?: string[];
  retry_policy?: RetryPolicy;
}

export interface UpdateCronjobInput extends Partial<CreateCronjobInput> {}
