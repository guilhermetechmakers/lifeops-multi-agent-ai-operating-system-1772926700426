/**
 * Types for 500 Server Error page and support ticket flow.
 * Optional integration with error logging / support API later.
 */

export interface ErrorContext {
  errorId: string;
  message: string;
  page: string;
  timestamp: string;
  userId?: string;
  stack?: string;
}

export interface SupportTicketPayload {
  subject?: string;
  description: string;
  errorId?: string;
  page?: string;
  timestamp?: string;
}

export interface GuidanceItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}
