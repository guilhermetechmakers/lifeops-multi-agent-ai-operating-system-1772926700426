/**
 * Terms of Service content types.
 * Structured for static or future CMS-driven content.
 */

export interface ToSSubsection {
  title: string;
  content: string | string[];
}

export interface ToSSection {
  id: string;
  title: string;
  content?: string | string[];
  subsections?: ToSSubsection[];
}

export interface ToSVersionInfo {
  version: string;
  effectiveDate: string;
}
