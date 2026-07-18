import { useAdminAuth } from "../context/AdminAuthContext"
import { AdminPageHeader, Panel } from "../components/AdminUI"

export default function AdminProfile() {
  const { admin } = useAdminAuth()
  return (
    <>
      <AdminPageHeader title="Profile" />
      <Panel>
        <p className="type-sm">
          Signed in as <strong>{admin?.email}</strong>
        </p>
        <p className="type-sm mt-2 text-[var(--color-text-secondary)]">
          Role: {admin?.role || "admin"}
        </p>
        <p className="type-caption mt-4 text-[var(--color-text-muted)]">
          Credentials are managed via ADMIN_EMAIL / ADMIN_PASSWORD on the server.
        </p>
      </Panel>
    </>
  )
}
