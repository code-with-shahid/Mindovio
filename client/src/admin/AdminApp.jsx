import { Navigate, Route, Routes } from "react-router-dom"
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext"
import AdminShell from "./components/AdminShell"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AdminAnalytics from "./pages/AdminAnalytics"
import AdminUsers from "./pages/AdminUsers"
import AdminNotes from "./pages/AdminNotes"
import AdminMockTests from "./pages/AdminMockTests"
import AdminPayments from "./pages/AdminPayments"
import AdminAnnouncements from "./pages/AdminAnnouncements"
import AdminFeedback from "./pages/AdminFeedback"
import AdminReports from "./pages/AdminReports"
import AdminLogs from "./pages/AdminLogs"
import AdminSettings from "./pages/AdminSettings"
import AdminAiUsage from "./pages/AdminAiUsage"
import AdminNotifications from "./pages/AdminNotifications"
import AdminSubscriptions from "./pages/AdminSubscriptions"
import AdminProfile from "./pages/AdminProfile"
import AdminError from "./pages/AdminError"
import { PageLoader } from "../components/ui/Spinner"

function AdminGate({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return <PageLoader />
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}

function AdminAppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        element={
          <AdminGate>
            <AdminShell />
          </AdminGate>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="ai-usage" element={<AdminAiUsage />} />
        <Route path="notes" element={<AdminNotes />} />
        <Route path="mock-tests" element={<AdminMockTests />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="*" element={<AdminError code={404} />} />
      </Route>
    </Routes>
  )
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminAppRoutes />
    </AdminAuthProvider>
  )
}
