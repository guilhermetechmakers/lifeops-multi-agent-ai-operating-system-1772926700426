import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { CentralErrorProvider } from "@/contexts/error-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/error";
import { SessionGuard } from "@/components/auth/session-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import AuthCallbackPage from "@/pages/auth-callback";
import AuthForgotPage from "@/pages/auth-forgot";
import DashboardMaster from "@/pages/dashboard-master";
import CronjobsDashboard from "@/pages/cronjobs-dashboard";
import Approvals from "@/pages/approvals";
import DashboardProjects from "@/pages/dashboard-projects";
import DashboardContent from "@/pages/dashboard-content";
import ArtifactsPage from "@/pages/artifacts";
import DashboardFinance from "@/pages/dashboard-finance";
import DashboardHealth from "@/pages/dashboard-health";
import DashboardSettings from "@/pages/dashboard-settings";
import CronjobDetail from "@/pages/cronjob-detail";
import RunDetailsPage from "@/pages/run-details";
import CronjobEditor from "@/pages/cronjob-editor";
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
          <Route path="/auth/forgot" element={<AuthForgotPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          <Route path="/password-reset" element={<Navigate to="/auth/forgot" replace />} />
          <Route path="/dashboard" element={<SessionGuard><DashboardLayout /></SessionGuard>}>
            <Route index element={<DashboardMaster />} />
            <Route path="cronjobs" element={<CronjobsDashboard />} />
            <Route path="cronjobs/new" element={<CronjobEditor />} />
            <Route path="cronjobs/:id" element={<CronjobDetail />} />
            <Route path="cronjobs/:id/runs/:runId" element={<RunDetailsPage />} />
            <Route path="cronjobs/:id/edit" element={<CronjobEditor />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="projects" element={<DashboardProjects />} />
            <Route path="content" element={<DashboardContent />} />
            <Route path="artifacts" element={<ArtifactsPage />} />
            <Route path="finance" element={<DashboardFinance />} />
            <Route path="health" element={<DashboardHealth />} />
            <Route path="settings" element={<DashboardSettings />} />
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
