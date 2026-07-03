import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PageLoader from "./components/common/PageLoader.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const LeadsPage = lazy(() => import("./pages/LeadsPage.jsx"));
const LeadDetailsPage = lazy(() => import("./pages/LeadDetailsPage.jsx"));
const CustomersPage = lazy(() => import("./pages/CustomersPage.jsx"));
const CustomerDetailsPage = lazy(() => import("./pages/CustomerDetailPage.jsx"));
const PipelinePage = lazy(() => import("./pages/PipelinePage.jsx"));
const TasksPage = lazy(() => import("./pages/TasksPage.jsx"));
const CommunicationsPage = lazy(() => import("./pages/CommunicationsPage.jsx"));
const ReportsPage = lazy(() => import("./pages/ReportsPage.jsx"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const CampaignsPage = lazy(() => import("./pages/CampaignsPage.jsx"));
const UsersPage = lazy(() => import("./pages/UsersPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/:id" element={<LeadDetailsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/communications" element={<CommunicationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
