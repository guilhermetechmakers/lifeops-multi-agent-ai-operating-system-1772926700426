/**
 * Terms of Service static content.
 * Structured for future CMS integration; validate with Array.isArray before render.
 */

import type { ToSSection, ToSVersionInfo } from "@/types/terms-of-service";

export const TOS_VERSION_INFO: ToSVersionInfo = {
  version: "1.0.0",
  effectiveDate: "March 8, 2025",
};

export const TOS_SECTIONS: ToSSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    content:
      "By accessing or using the LifeOps platform (the \"Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, you may not access or use the Service. We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.",
    subsections: [
      {
        title: "Eligibility",
        content:
          "You must be at least 18 years of age and have the legal capacity to enter into a binding agreement to use the Service. By using the Service, you represent and warrant that you meet these requirements.",
      },
      {
        title: "Account registration",
        content:
          "You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      },
    ],
  },
  {
    id: "user-rights",
    title: "User rights and responsibilities",
    content:
      "You retain ownership of the content you create and submit through the Service. By submitting content, you grant LifeOps a limited, non-exclusive license to use, store, and process your content as necessary to provide and improve the Service.",
    subsections: [
      {
        title: "Permitted use",
        content: [
          "Use the Service in accordance with these Terms and applicable laws",
          "Maintain accurate account information",
          "Notify us promptly of any unauthorized access to your account",
          "Use the Service only for lawful purposes",
        ],
      },
      {
        title: "Prohibited conduct",
        content: [
          "Violating any applicable laws or regulations",
          "Infringing on the intellectual property or privacy rights of others",
          "Transmitting malware, viruses, or harmful code",
          "Attempting to gain unauthorized access to the Service or other users' accounts",
          "Using the Service for any fraudulent or abusive purpose",
          "Reselling or redistributing the Service without authorization",
        ],
      },
    ],
  },
  {
    id: "platform-limitations",
    title: "Platform limitations",
    content:
      "The Service is provided \"as is\" and \"as available.\" We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components. We may modify, suspend, or discontinue any part of the Service at any time with or without notice.",
    subsections: [
      {
        title: "AI and automation",
        content:
          "LifeOps uses AI-powered agents to automate tasks. AI outputs are not guaranteed to be accurate, complete, or suitable for your specific use case. You are responsible for reviewing and validating all AI-generated content and decisions before relying on them.",
      },
      {
        title: "Third-party integrations",
        content:
          "The Service may integrate with third-party services. We are not responsible for the availability, accuracy, or content of third-party services. Your use of third-party integrations is subject to their respective terms and policies.",
      },
    ],
  },
  {
    id: "privacy-data",
    title: "Privacy and data handling",
    content:
      "Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, retain, and protect your personal data. By using the Service, you consent to our data practices as described in the Privacy Policy.",
    subsections: [
      {
        title: "Data processing",
        content:
          "We process your data in accordance with applicable data protection laws. We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or alteration.",
      },
      {
        title: "Data retention",
        content:
          "We retain your data for as long as your account is active and as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data subject to applicable retention requirements.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content:
      "To the maximum extent permitted by applicable law, LifeOps and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill.",
    subsections: [
      {
        title: "Cap on liability",
        content:
          "Our total liability for any claims arising from or related to the Service shall not exceed the greater of (a) the amount you paid us in the twelve months preceding the claim, or (b) one hundred United States dollars (USD $100).",
      },
      {
        title: "Exclusions",
        content:
          "Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.",
      },
    ],
  },
  {
    id: "termination",
    title: "Termination",
    content:
      "We may suspend or terminate your access to the Service at any time, with or without cause or notice, including for violation of these Terms. Upon termination, your right to use the Service ceases immediately.",
    subsections: [
      {
        title: "Effect of termination",
        content:
          "Upon termination, we may delete your account and associated data. You may export your data prior to termination using the tools we provide. We are not obligated to retain your data after termination.",
      },
      {
        title: "Survival",
        content:
          "Provisions that by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnification, and limitations of liability.",
      },
    ],
  },
  {
    id: "dispute-resolution",
    title: "Dispute resolution",
    content:
      "Any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive relief in any court of competent jurisdiction.",
    subsections: [
      {
        title: "Class action waiver",
        content:
          "You agree to resolve disputes with us on an individual basis and waive any right to participate in a class action or representative proceeding.",
      },
      {
        title: "Governing law",
        content:
          "These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.",
      },
    ],
  },
  {
    id: "general",
    title: "General provisions",
    content:
      "These Terms constitute the entire agreement between you and LifeOps regarding the Service and supersede any prior agreements. If any provision is found to be unenforceable, the remaining provisions shall remain in full force and effect.",
    subsections: [
      {
        title: "Assignment",
        content:
          "You may not assign or transfer these Terms or your rights under them without our prior written consent. We may assign our rights and obligations without restriction.",
      },
      {
        title: "Contact",
        content:
          "For questions about these Terms, please contact our Legal team using the contact information provided in the Legal Inquiries section below.",
      },
    ],
  },
];
