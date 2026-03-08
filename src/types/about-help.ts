/**
 * About & Help page data models.
 * Compatible with future API: GET /about-help/docs, /faqs, /support/tickets, /onboarding/steps, /community/channels.
 */

export interface AboutHeaderData {
  version: string;
  company: string;
  mission: string;
  privacyUrl?: string;
  termsUrl?: string;
}

export interface Doc {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  tag?: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
}

export interface Ticket {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  priority?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
}

export interface Channel {
  id: string;
  name: string;
  url: string;
  emoji: string;
  description: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  snippet: string;
  url: string;
}

export interface VersionHistoryItem {
  version: string;
  date: string;
  notes: string;
}
