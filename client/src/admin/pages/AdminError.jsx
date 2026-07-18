import { Link } from "react-router-dom"
import { AdminPageHeader, Panel } from "../components/AdminUI"

export default function AdminError({ code = 404, message }) {
  const titles = {
    403: "Forbidden",
    404: "Page not found",
    500: "Something went wrong",
  }
  return (
    <>
      <AdminPageHeader title={`${code} · ${titles[code] || "Error"}`} />
      <Panel>
        <p className="type-sm text-[var(--color-text-secondary)]">
          {message || "This admin page doesn’t exist or you don’t have access."}
        </p>
        <Link
          to="/admin"
          className="inline-block mt-4 text-sm font-semibold text-brand-500 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </Panel>
    </>
  )
}
