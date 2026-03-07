/**
 * Artifacts page — Artifact Manager with full panel.
 * LifeOps design system; nested under dashboard layout.
 */

import { AnimatedPage } from "@/components/animated-page";
import { ArtifactManagerPanel } from "@/components/artifacts";

export default function ArtifactsPage() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Artifacts</h1>
        <p className="text-sm text-muted-foreground">
          Upload, manage, and attach artifacts to content and runs
        </p>
      </div>
      <ArtifactManagerPanel />
    </AnimatedPage>
  );
}
