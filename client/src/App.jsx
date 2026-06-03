import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import History from "./pages/History"
import Notes from "./pages/Notes"
import Pricing from "./pages/Pricing"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentFailed from "./pages/PaymentFailed"
import ProtectedRoute, { GuestRoute } from "./components/layout/ProtectedRoute"
import { useAuth } from "./context/AuthContext"
import { PageLoader } from "./components/ui/Spinner"

function App() {
  const { initializing } = useAuth()

  if (initializing) return <PageLoader />

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

      {/* Legacy redirect */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />

      {/* Payment callbacks */}
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
    </Routes>
  )
}

export default App
