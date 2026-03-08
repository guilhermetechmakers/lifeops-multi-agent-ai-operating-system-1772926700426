/**
 * useAboutHelp — React Query hooks for About & Help page data.
 * All list responses normalized with (data ?? []).
 */

import { useQuery } from "@tanstack/react-query";
import {
  getAboutHeader,
  getDocs,
  getFaqs,
  getTickets,
  getOnboardingSteps,
  getChannels,
  getVersionHistory,
} from "@/api/about-help";

export const ABOUT_HELP_QUERY_KEYS = {
  header: ["about-help", "header"] as const,
  docs: ["about-help", "docs"] as const,
  faqs: ["about-help", "faqs"] as const,
  tickets: ["about-help", "tickets"] as const,
  onboarding: ["about-help", "onboarding"] as const,
  channels: ["about-help", "channels"] as const,
  versionHistory: ["about-help", "version-history"] as const,
};

export function useAboutHeader() {
  return useQuery({
    queryKey: ABOUT_HELP_QUERY_KEYS.header,
    queryFn: getAboutHeader,
  });
}

export function useAboutDocs() {
  const q = useQuery({
    queryKey: ABOUT_HELP_QUERY_KEYS.docs,
    queryFn: getDocs,
  });
  return {
    ...q,
    docs: Array.isArray(q.data) ? q.data : (q.data ?? []),
  };
}

export function useAboutFaqs() {
  const q = useQuery({
    queryKey: ABOUT_HELP_QUERY_KEYS.faqs,
    queryFn: getFaqs,
  });
  return {
    ...q,
    questions: Array.isArray(q.data) ? q.data : (q.data ?? []),
  };
}

export function useAboutTickets() {
  const q = useQuery({
    queryKey: ABOUT_HELP_QUERY_KEYS.tickets,
    queryFn: getTickets,
  });
  return {
    ...q,
    tickets: Array.isArray(q.data) ? q.data : (q.data ?? []),
  };
}

export function useAboutOnboardingSteps() {
  const q = useQuery({
    queryKey: ABOUT_HELP_QUERY_KEYS.onboarding,
    queryFn: getOnboardingSteps,
  });
  return {
    ...q,
    steps: Array.isArray(q.data) ? q.data : (q.data ?? []),
  };
}

export function useAboutChannels() {
  const q = useQuery({
    queryKey: ABOUT_HELP_QUERY_KEYS.channels,
    queryFn: getChannels,
  });
  return {
    ...q,
    channels: Array.isArray(q.data) ? q.data : (q.data ?? []),
  };
}

export function useVersionHistory() {
  const q = useQuery({
    queryKey: ABOUT_HELP_QUERY_KEYS.versionHistory,
    queryFn: getVersionHistory,
  });
  return {
    ...q,
    history: Array.isArray(q.data) ? q.data : (q.data ?? []),
  };
}
