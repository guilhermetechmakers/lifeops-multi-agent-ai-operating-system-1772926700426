/**
 * Data models for Loading / Success / Failure UI primitives.
 * Used across modules (projects, content, finance, health, cronjobs, approvals).
 */

export type LoadingStatus = "loading" | "idle";

export interface LoadingProgress {
  id: string;
  status: "loading" | "success" | "failure";
  message?: string;
  timestamp: string;
  runId?: string;
  artifacts?: string[];
}

export interface NextStep {
  title: string;
  description?: string;
  href?: string;
}

export interface ErrorInfo {
  errorCode: string;
  message: string;
  details?: string;
}

export type StatusBannerVariant = "loading" | "success" | "failure";

export type ActionKind = "primary" | "secondary" | "ghost";

export interface StatusBannerAction {
  label: string;
  onClick: () => void;
  kind?: ActionKind;
}

/** Alias for StatusBannerAction used in StatusBanner */
export type BannerAction = StatusBannerAction;
