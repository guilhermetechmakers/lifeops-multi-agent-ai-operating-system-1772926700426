/**
 * Loading / Success / Failure UI primitives for LifeOps dashboard.
 * Use across modules: projects, content, finance, health, cronjobs, approvals.
 */

export type {
  LoadingProgress,
  NextStep,
  ErrorInfo,
  StatusBannerVariant,
  StatusBannerAction,
  ActionKind,
  LoadingStatus,
} from "@/types/loading-success";

export { LoadingSpinner } from "./loading-spinner";
export type { LoadingSpinnerProps, SpinnerSize } from "./loading-spinner";

export { StatusBanner } from "./status-banner";
export type { StatusBannerProps, StatusBannerVariant } from "./status-banner";

export { ErrorSnippet, ErrorSnippetFromInfo } from "./error-snippet";
export type {
  ErrorSnippetProps,
  ErrorSnippetFromInfoProps,
} from "./error-snippet";

export { NextStepsPanel } from "./next-steps-panel";
export type { NextStepsPanelProps } from "./next-steps-panel";

export { GatedActionButton } from "./gated-action-button";
export type { GatedActionButtonProps } from "./gated-action-button";

export { InlineMessage } from "./inline-message";
export type { InlineMessageProps, InlineMessageVariant } from "./inline-message";
