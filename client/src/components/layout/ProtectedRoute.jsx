import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { useAuth } from "../../context/AuthContext"
import { PageLoader } from "../ui/Spinner"

export default function ProtectedRoute({ children }) {
  const { initializing } = useAuth()
  const { userData } = useSelector((state) => state.user)
  const location = useLocation()

  if (initializing) return <PageLoader />
  if (!userData) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

export function GuestRoute({ children }) {
  const { initializing } = useAuth()
  const { userData } = useSelector((state) => state.user)
  const location = useLocation()
  const from = location.state?.from?.pathname || "/dashboard"

  if (initializing) return <PageLoader />
  if (userData) return <Navigate to={from} replace />

  return children
}
