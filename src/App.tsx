import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { CentralErrorProvider } from "@/contexts/error-context";
import { AuthProvider } from "@/contexts/auth-context";
import { CommandPaletteProvider } from "@/contexts/command-palette-context";
import { ErrorBoundary } from "@/components/error";
import { SessionGuard } from "@/components/auth/session-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import AuthCallbackPage from "@/pages/auth-callback";
import { PasswordResetPage } from "@/components/auth/password-reset";
import VerifyEmailPage from "@/pages/verify-email";
import DashboardMaster from "@/pages/dashboard-master";
import CronjobsDashboard from "@/pages/cronjobs-dashboard";
import Approvals from "@/pages/approvals";
import { ProjectsDashboardShell } from "@/components/projects-dashboard";
import ProjectDetail from "@/pages/project-detail";
import TicketBoardPage from "@/pages/ticket-board";
import ContentDashboardPage from "@/pages/content-dashboard";
import ContentLibraryPage from "@/pages/content-library";
import ContentEditorPage from "@/pages/content-editor";
import ContentCalendarPage from "@/pages/content-calendar";
import ArtifactsPage from "@/pages/artifacts";
import { FinanceDashboardShell, FinanceOverview } from "@/components/finance-dashboard";
import FinanceSubscriptionsPage from "@/pages/finance-subscriptions";
import CheckoutPage from "@/pages/checkout";
import FinanceTransactionsPage from "@/pages/finance-transactions";
import FinanceHistoryPage from "@/pages/finance-history";
import ForecastingReportsPage from "@/pages/forecasting-reports";
import { HealthDashboardShell, HealthDashboardOverview } from "@/components/health-dashboard";
import HealthHabitsPage from "@/pages/health-habits";
import HealthTrainingMealsPage from "@/pages/health-training-meals";
import { SettingsDashboardShell } from "@/components/settings";
import SettingsGlobalPage from "@/pages/settings-global";
import SettingsIntegrationsPage from "@/pages/settings-integrations";
import SettingsDataSecurityPage from "@/pages/settings-data-security";
import SettingsBillingPage from "@/pages/settings-billing";
import SettingsExportsPage from "@/pages/settings-exports";
import SettingsProfileRedirectPage from "@/pages/settings-profile-redirect";
import { UserProfileLayout } from "@/components/profile";
import {
  PersonalInfoPanel,
  IntegrationsPanel,
  SecurityPanel,
  ApiKeysPanel,
  BillingPanel,
  PreferencesPanel,
} from "@/components/profile";
import AboutHelpPage from "@/pages/about-help";
import {
  AdminDashboardShell,
  AdminOverview,
  UserManagementPage,
  OrganizationsPanel,
  RolesPanel,
  IntegrationsPanel as AdminIntegrationsPanel,
  CompliancePanel,
  BillingPanel as AdminBillingPanel,
  AdminCronjobsPanel,
  ReportsPanel,
} from "@/components/admin";
import CronjobDetail from "@/pages/cronjob-detail";
import RunDetailsPage from "@/pages/run-details";
import CronjobEditor from "@/pages/cronjob-editor";
import CIIntegrationsPage from "@/pages/ci-integrations";
import AgentTraceDebuggerPage from "@/pages/agent-trace-debugger";
import { AnalyticsDashboardShell, AnalyticsReportsOverview } from "@/components/analytics-reports";
import NotFound from "@/pages/not-found";
import ServerErrorPage from "@/pages/server-error";
import Docs from "@/pages/docs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <CentralErrorProvider>
        <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/about-help" element={<Navigate to="/dashboard/about-help" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/forgot" element={<PasswordResetPage />} />
          <Route path="/auth/reset" element={<PasswordResetPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/password-reset" element={<Navigate to="/auth/forgot" replace />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          {/* Content Dashboard canonical URLs (redirect to dashboard nested routes) */}
          <Route path="/analytics-reports" element={<Navigate to="/dashboard/analytics-reports" replace />} />
          <Route path="/content-dashboard" element={<Navigate to="/dashboard/content" replace />} />
          <Route path="/habits-tracker" element={<Navigate to="/dashboard/health/habits" replace />} />
          <Route path="/content-dashboard/editor" element={<Navigate to="/dashboard/content/editor" replace />} />
          <Route path="/dashboard" element={<SessionGuard><CommandPaletteProvider><DashboardLayout /></CommandPaletteProvider></SessionGuard>}>
            <Route index element={<DashboardMaster />} />
            <Route path="cronjobs" element={<CronjobsDashboard />} />
            <Route path="cronjobs/new" element={<CronjobEditor />} />
            <Route path="cronjobs/:id" element={<CronjobDetail />} />
            <Route path="cronjobs/:id/runs/:runId" element={<RunDetailsPage />} />
            <Route path="runs/:runId" element={<RunDetailsPage />} />
            <Route path="cronjobs/:id/edit" element={<CronjobEditor />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="admin" element={<AdminDashboardShell />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="organizations" element={<OrganizationsPanel />} />
              <Route path="roles" element={<RolesPanel />} />
              <Route path="integrations" element={<AdminIntegrationsPanel />} />
              <Route path="compliance" element={<CompliancePanel />} />
              <Route path="billing" element={<AdminBillingPanel />} />
              <Route path="cronjobs" element={<AdminCronjobsPanel />} />
              <Route path="reports" element={<ReportsPanel />} />
            </Route>
            <Route path="debug" element={<AgentTraceDebuggerPage />} />
            <Route path="projects" element={<Outlet />}>
              <Route index element={<ProjectsDashboardShell />} />
              <Route path=":projectId" element={<ProjectsDashboardShell />} />
              <Route path=":projectId/detail" element={<ProjectDetail />} />
              <Route path=":projectId/ci-integrations" element={<CIIntegrationsPage />} />
              <Route path=":projectId/ticket-board" element={<TicketBoardPage />} />
            </Route>
            <Route path="content" element={<ContentDashboardPage />} />
            <Route path="content/library" element={<ContentLibraryPage />} />
            <Route path="content/editor" element={<ContentEditorPage />} />
            <Route path="content/calendar" element={<ContentCalendarPage />} />
            <Route path="artifacts" element={<ArtifactsPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="finance" element={<FinanceDashboardShell />}>
              <Route index element={<FinanceOverview />} />
              <Route path="subscriptions" element={<FinanceSubscriptionsPage />} />
              <Route path="subscriptions-billing" element={<FinanceSubscriptionsPage />} />
              <Route path="transactions" element={<FinanceTransactionsPage />} />
              <Route path="history" element={<FinanceHistoryPage />} />
              <Route path="forecasting" element={<ForecastingReportsPage />} />
            </Route>
            <Route path="health" element={<HealthDashboardShell />}>
              <Route index element={<HealthDashboardOverview />} />
              <Route path="habits" element={<HealthHabitsPage />} />
              <Route path="training-meals" element={<HealthTrainingMealsPage />} />
            </Route>
            <Route path="analytics-reports" element={<AnalyticsDashboardShell />}>
              <Route index element={<AnalyticsReportsOverview />} />
            </Route>
            <Route path="about-help" element={<AboutHelpPage />} />
            <Route path="settings" element={<SettingsDashboardShell />}>
              <Route index element={<SettingsGlobalPage />} />
              <Route path="profile" element={<SettingsProfileRedirectPage />} />
              <Route path="integrations" element={<SettingsIntegrationsPage />} />
              <Route path="data-security" element={<SettingsDataSecurityPage />} />
              <Route path="billing" element={<SettingsBillingPage />} />
              <Route path="exports" element={<SettingsExportsPage />} />
            </Route>
            <Route path="profile" element={<UserProfileLayout />}>
              <Route index element={<Navigate to="personal" replace />} />
              <Route path="personal" element={<PersonalInfoPanel />} />
              <Route path="integrations" element={<IntegrationsPanel />} />
              <Route path="security" element={<SecurityPanel />} />
              <Route path="api-keys" element={<ApiKeysPanel />} />
              <Route path="billing" element={<BillingPanel />} />
              <Route path="preferences" element={<PreferencesPanel />} />
            </Route>
          </Route>
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
        </AuthProvider>
      </CentralErrorProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgb(21 23 24)",
            border: "1px solid rgba(255,255,255,0.03)",
            color: "rgb(255 255 255)",
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
