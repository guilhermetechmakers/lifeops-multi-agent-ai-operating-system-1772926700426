/**
 * CI & Integrations Page — manage repository links, CI/CD connectors, deployment targets.
 */

import { useParams } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { IntegrationsDashboard } from "@/components/ci-integrations";

export default function CIIntegrationsPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <AnimatedPage>
        <div className="text-center py-12 text-muted-foreground">Project not found</div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <IntegrationsDashboard projectId={projectId} />
    </AnimatedPage>
  );
}
