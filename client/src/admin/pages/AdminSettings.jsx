import { useEffect, useState } from "react"
import { fetchSettings } from "../services/adminApi"
import { useTheme } from "../../context/ThemeContext"
import { AdminPageHeader, Panel, SkeletonGrid } from "../components/AdminUI"

export default function AdminSettings() {
  const { theme, toggleTheme } = useTheme()
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => setSettings(null))
  }, [])

  if (!settings) {
    return (
      <>
        <AdminPageHeader title="Settings" />
        <SkeletonGrid count={2} />
      </>
    )
  }

  return (
    <>
      <AdminPageHeader title="Settings" subtitle="Admin & environment" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Admin profile">
          <p className="type-sm">
            Email: <strong>{settings.adminEmail}</strong>
          </p>
          <p className="type-sm mt-2 text-[var(--color-text-secondary)]">
            Password is stored only in server environment variables. Change it by updating{" "}
            <code>ADMIN_PASSWORD</code> and restarting the server.
          </p>
          <p className="type-sm mt-2">Session length: {settings.sessionHours}h</p>
        </Panel>
        <Panel title="Theme">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold"
          >
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </button>
        </Panel>
        <Panel title="Integrations">
          <ul className="space-y-2 type-sm">
            <li>Gemini: {settings.geminiConfigured ? "Configured" : "Missing"}</li>
            <li>Stripe: {settings.stripeConfigured ? "Configured" : "Missing"}</li>
            <li>MongoDB: {settings.mongoConfigured ? "Configured" : "Missing"}</li>
            <li>Client URL: {settings.clientUrl || "—"}</li>
            <li>NODE_ENV: {settings.nodeEnv}</li>
          </ul>
        </Panel>
        <Panel title="Coming soon">
          <ul className="space-y-2 type-sm text-[var(--color-text-secondary)]">
            {Object.entries(settings.placeholders || {}).map(([k, v]) => (
              <li key={k}>
                <strong className="capitalize text-[var(--color-text-primary)]">{k}:</strong>{" "}
                {v}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
