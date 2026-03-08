/**
 * Privacy Policy page — Route: /privacy-policy
 * Self-contained legal content page; no API calls.
 */

import { useEffect } from "react";
import { PrivacyPolicyPage } from "@/components/privacy-policy";

export default function PrivacyPolicyRoute() {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevMetaContent = metaDesc?.getAttribute("content") ?? "";

    document.title = "Privacy Policy – LifeOps";
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "LifeOps Privacy Policy: how we collect, use, retain, and protect your personal data. Your rights and how to contact us."
      );
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevMetaContent) {
        metaDesc.setAttribute("content", prevMetaContent);
      }
    };
  }, []);

  return <PrivacyPolicyPage />;
}
