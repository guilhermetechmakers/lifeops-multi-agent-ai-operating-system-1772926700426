/**
 * CMS bridge for landing page content. Fetches from GET /landing/content when
 * available; falls back to static defaultLandingContent with full null-safety.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchLandingContent } from "@/api/landing";
import { defaultLandingContent } from "@/data/landing-content";
import type { SectionContent } from "@/types/landing";

const LANDING_QUERY_KEY = ["landing-content"] as const;

export function useLandingContent(): {
  data: SectionContent;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: LANDING_QUERY_KEY,
    queryFn: fetchLandingContent,
    initialData: defaultLandingContent,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const content: SectionContent = data ?? defaultLandingContent;

  return {
    data: content,
    isLoading,
    isError,
  };
}
