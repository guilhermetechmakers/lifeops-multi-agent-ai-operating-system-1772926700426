/**
 * Terms of Service page — Route: /terms
 * Self-contained legal content page; no API calls.
 */

import { useEffect } from "react";
import { ToSPage } from "@/components/terms-of-service";

export default function TermsOfServiceRoute() {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevMetaContent = metaDesc?.getAttribute("content") ?? "";

    document.title = "Terms of Service – LifeOps";
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "LifeOps Terms of Service: user rights, responsibilities, platform limitations, privacy, liability, termination, and dispute resolution."
      );
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevMetaContent) {
        metaDesc.setAttribute("content", prevMetaContent);
      }
    };
  }, []);

  return <ToSPage />;
}
