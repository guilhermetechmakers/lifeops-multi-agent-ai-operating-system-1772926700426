/**
 * About & Help page data models.
 * Compatible with future API integration.
 */

export interface AboutInfo {
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
  tags?: string[];
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
  message?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt?: string;
  updatedAt: string;
  priority?: "low" | "medium" | "high";
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
  type: "doc" | "faq";
  snippet: string;
  url: string;
}

export interface VersionHistory {
  version: string;
  date: string;
  notes: string;
}
