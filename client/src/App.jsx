import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import History from "./pages/History"
import Notes from "./pages/Notes"
import Pricing from "./pages/Pricing"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentFailed from "./pages/PaymentFailed"
import NotFound from "./pages/NotFound"
import MockTest from "./pages/MockTest"
import MockTestHistory from "./pages/MockTestHistory"
import ProtectedRoute, { GuestRoute } from "./components/layout/ProtectedRoute"
import { useAuth } from "./context/AuthContext"
import { PageLoader } from "./components/ui/Spinner"

const AdminApp = lazy(() => import("./admin/AdminApp"))

function App() {
  const { initializing } = useAuth()

  if (initializing) return <PageLoader />

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
      <Route path="/mock-tests" element={<ProtectedRoute><MockTestHistory /></ProtectedRoute>} />
      <Route path="/mock-test/:testId" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />

      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminApp />
          </Suspense>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
