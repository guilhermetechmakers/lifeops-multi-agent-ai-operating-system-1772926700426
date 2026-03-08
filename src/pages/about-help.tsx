/**
 * About & Help — Central hub for app info, docs, FAQ, support, onboarding, and community.
 * All data from useAboutHelp hooks; arrays guarded. Route: /dashboard/about-help.
 */

import { AnimatedPage } from "@/components/animated-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AboutHeaderCard,
  DocumentationHubCard,
  FAQSearchPanel,
  ContactSupportPanel,
  OnboardingResourcesPanel,
  CommunityLinksPanel,
  GlobalSearchBar,
  AppInfoDrawer,
} from "@/components/about-help";
import {
  useAboutHeader,
  useAboutDocs,
  useAboutFaqs,
  useAboutTickets,
  useAboutOnboardingSteps,
  useAboutChannels,
  useVersionHistory,
} from "@/hooks/use-about-help";

function AboutHelpSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export default function AboutHelpPage() {
  const headerQuery = useAboutHeader();
  const { docs, isLoading: docsLoading } = useAboutDocs();
  const { questions: faqs, isLoading: faqsLoading } = useAboutFaqs();
  const { tickets, refetch: refetchTickets } = useAboutTickets();
  const { steps } = useAboutOnboardingSteps();
  const { channels } = useAboutChannels();
  const { history: versionHistory } = useVersionHistory();

  const isLoading = headerQuery.isLoading || docsLoading || faqsLoading;
  const headerData = headerQuery.data ?? undefined;

  if (isLoading) {
    return (
      <AnimatedPage className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            About &amp; Help
          </h1>
          <p className="text-sm text-muted-foreground">
            App information, documentation, FAQ, support, and onboarding.
          </p>
        </div>
        <AboutHelpSkeleton />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            About &amp; Help
          </h1>
          <p className="text-sm text-muted-foreground">
            App information, documentation, FAQ, support, and onboarding.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GlobalSearchBar docs={docs} faqs={faqs} />
          <AppInfoDrawer history={versionHistory} />
        </div>
      </header>

      <section aria-labelledby="about-heading">
        <AboutHeaderCard data={headerData} />
      </section>

      <section aria-labelledby="docs-heading">
        <DocumentationHubCard docs={docs} />
      </section>

      <section aria-labelledby="faq-heading" className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <FAQSearchPanel questions={faqs} />
        </div>
        <div className="lg:col-span-1">
          <ContactSupportPanel
            tickets={tickets}
            onTicketSubmitted={() => refetchTickets()}
          />
        </div>
      </section>

      <section aria-labelledby="onboarding-heading">
        <OnboardingResourcesPanel steps={steps} />
      </section>

      <section aria-labelledby="community-heading">
        <CommunityLinksPanel channels={channels} />
      </section>
    </AnimatedPage>
  );
}
