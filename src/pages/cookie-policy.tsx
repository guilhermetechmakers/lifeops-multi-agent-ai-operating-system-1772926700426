/**
 * Cookie Policy page — Route: /cookies
 * Self-contained consent management; persists to localStorage.
 */

import { useEffect } from "react";
import { CookiePolicyPage } from "@/components/cookie-policy";

export default function CookiePolicyRoute() {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevMetaContent = metaDesc?.getAttribute("content") ?? "";

    document.title = "Cookie Policy – LifeOps";
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "LifeOps Cookie Policy: manage your cookie preferences. Control necessary, analytics, and marketing cookies."
      );
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevMetaContent) {
        metaDesc.setAttribute("content", prevMetaContent);
      }
    };
  }, []);

  return <CookiePolicyPage />;
}
