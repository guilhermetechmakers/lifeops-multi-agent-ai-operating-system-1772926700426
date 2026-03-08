/**
 * Privacy Policy content types.
 * Structured for static or future CMS-driven content.
 */

export interface PolicySubsection {
  title: string;
  content: string | string[];
}

export interface PolicySection {
  id?: string;
  title: string;
  content?: string | string[];
  subsections?: PolicySubsection[];
}
