import { Navigate } from "react-router-dom"
import { useAdminAuth } from "../context/AdminAuthContext"
import { PageLoader } from "../../components/ui/Spinner"

/** Admin uses the main /login page (ADMIN_EMAIL + ADMIN_PASSWORD from server .env). */
export default function AdminLogin() {
  const { admin, loading } = useAdminAuth()

  if (loading) return <PageLoader />
  if (admin) return <Navigate to="/admin" replace />
  return <Navigate to="/login" replace />
}
