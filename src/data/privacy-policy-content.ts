/**
 * Privacy Policy static content.
 * Structured for future CMS integration; validate with Array.isArray before render.
 */

import type { PolicySection } from "@/types/privacy-policy";

export const PRIVACY_POLICY_SECTIONS: PolicySection[] = [
  {
    id: "data-collection",
    title: "Data collection",
    subsections: [
      {
        title: "Categories of personal data",
        content: [
          "Account information: email, name, profile details",
          "Usage data: feature usage, session logs, and interaction patterns",
          "Content data: projects, artifacts, and configurations you create",
          "Payment information: processed by our payment provider; we do not store full card details",
          "Communication data: support tickets and correspondence",
        ],
      },
      {
        title: "Purposes",
        content:
          "We use your data to provide and improve the LifeOps service, personalize your experience, process payments, send important notices, and comply with legal obligations.",
      },
      {
        title: "Lawful grounds",
        content: [
          "Contract performance: to deliver the services you signed up for",
          "Legitimate interests: to improve our product, prevent fraud, and ensure security",
          "Consent: where you have given explicit consent (e.g., marketing, optional features)",
          "Legal obligation: where required by law",
        ],
      },
      {
        title: "Cookies and similar technologies",
        content:
          "We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. You can manage cookie preferences via your browser settings or our Consent Controls. Essential cookies are required for the service to function.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "Data retention",
    subsections: [
      {
        title: "Retention periods",
        content: [
          "Account data: retained while your account is active and for a defined period after closure",
          "Usage logs: typically 90 days to 1 year, depending on your settings",
          "Backups: up to 30 days for disaster recovery",
        ],
      },
      {
        title: "Deletion schedules",
        content:
          "Upon account deletion request, we will remove or anonymize your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., dispute resolution).",
      },
    ],
  },
  {
    id: "data-processing-sharing",
    title: "Data processing & sharing",
    subsections: [
      {
        title: "Third parties and subprocessors",
        content:
          "We use trusted service providers (hosting, analytics, payment processing) that process data on our behalf under strict data processing agreements. We do not sell your personal data.",
      },
      {
        title: "International transfers",
        content:
          "Your data may be processed in jurisdictions outside your country of residence. We ensure appropriate safeguards (e.g., standard contractual clauses) where required.",
      },
    ],
  },
  {
    id: "user-rights",
    title: "User rights",
    content: [
      "Access: request a copy of your personal data we hold",
      "Correction: request correction of inaccurate or incomplete data",
      "Deletion: request deletion of your data, subject to legal exceptions",
      "Data portability: receive your data in a structured, machine-readable format",
      "Objection: object to processing based on legitimate interests",
      "Withdrawal of consent: withdraw consent where processing is consent-based",
    ],
    subsections: [
      {
        title: "Exercising your rights",
        content:
          "Contact us at the email address in the Contact information section. We will respond within 30 days. You may also have the right to lodge a complaint with a supervisory authority.",
      },
    ],
  },
  {
    id: "security-measures",
    title: "Security measures",
    content: [
      "Encryption in transit (TLS) and at rest where applicable",
      "Access controls and role-based permissions",
      "Regular security assessments and monitoring",
      "Incident response procedures",
      "Employee training on data protection",
    ],
  },
];
