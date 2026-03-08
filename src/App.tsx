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
import DashboardContent from "@/pages/dashboard-content";
import ArtifactsPage from "@/pages/artifacts";
import DashboardFinance from "@/pages/dashboard-finance";
import DashboardHealth from "@/pages/dashboard-health";
import DashboardSettings from "@/pages/dashboard-settings";
import { UserProfileLayout } from "@/components/profile";
import {
  PersonalInfoPanel,
  IntegrationsPanel,
  SecurityPanel,
  ApiKeysPanel,
  BillingPanel,
  PreferencesPanel,
} from "@/components/profile";
import CronjobDetail from "@/pages/cronjob-detail";
import RunDetailsPage from "@/pages/run-details";
import CronjobEditor from "@/pages/cronjob-editor";
import AgentTraceDebuggerPage from "@/pages/agent-trace-debugger";
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
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/forgot" element={<PasswordResetPage />} />
          <Route path="/auth/reset" element={<PasswordResetPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/password-reset" element={<Navigate to="/auth/forgot" replace />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          <Route path="/dashboard" element={<SessionGuard><CommandPaletteProvider><DashboardLayout /></CommandPaletteProvider></SessionGuard>}>
            <Route index element={<DashboardMaster />} />
            <Route path="cronjobs" element={<CronjobsDashboard />} />
            <Route path="cronjobs/new" element={<CronjobEditor />} />
            <Route path="cronjobs/:id" element={<CronjobDetail />} />
            <Route path="cronjobs/:id/runs/:runId" element={<RunDetailsPage />} />
            <Route path="runs/:runId" element={<RunDetailsPage />} />
            <Route path="cronjobs/:id/edit" element={<CronjobEditor />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="debug" element={<AgentTraceDebuggerPage />} />
            <Route path="projects" element={<Outlet />}>
              <Route index element={<ProjectsDashboardShell />} />
              <Route path=":projectId" element={<ProjectsDashboardShell />} />
              <Route path=":projectId/detail" element={<ProjectDetail />} />
              <Route path=":projectId/ticket-board" element={<TicketBoardPage />} />
            </Route>
            <Route path="content" element={<DashboardContent />} />
            <Route path="artifacts" element={<ArtifactsPage />} />
            <Route path="finance" element={<DashboardFinance />} />
            <Route path="health" element={<DashboardHealth />} />
            <Route path="settings" element={<DashboardSettings />} />
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
