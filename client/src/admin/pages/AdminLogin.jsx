import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react"
import { useAdminAuth } from "../context/AdminAuthContext"
import { useTheme } from "../../context/ThemeContext"
import { BRAND_NAME } from "../../constants/brand"

const REMEMBER_KEY = "mindovio-admin-email"

export default function AdminLogin() {
  const { admin, loading, login } = useAdminAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || "")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && admin) navigate("/admin", { replace: true })
  }, [admin, loading, navigate])

  if (loading) {
    return (
      <div className="admin-auth-screen flex items-center justify-center">
        <div className="admin-skeleton h-10 w-48 rounded-xl" />
      </div>
    )
  }

  if (admin) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim())
      else localStorage.removeItem(REMEMBER_KEY)
      navigate("/admin", { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-auth-screen relative flex min-h-dvh items-center justify-center px-4 py-10">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)]"
      >
        {theme === "dark" ? "Light" : "Dark"} mode
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="admin-glass w-full max-w-md rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8BFF] text-white shadow-lg shadow-[#7C5CFF]/30">
            <Shield size={22} />
          </span>
          <div>
            <p className="type-caption text-brand-500 font-semibold">Admin Console</p>
            <h1 className="type-h3">{BRAND_NAME}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="ui-label">Email</span>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]"
                aria-hidden
              />
              <input
                type="email"
                className="ui-input admin-input-icon-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="ui-label">Password</span>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]"
                aria-hidden
              />
              <input
                type={showPass ? "text" : "password"}
                className="ui-input admin-input-icon-left admin-input-icon-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-[var(--color-border)]"
              />
              Remember me
            </label>
            <span
              className="cursor-not-allowed text-[var(--color-text-muted)] opacity-70"
              title="Coming soon"
            >
              Forgot password
            </span>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="premium-btn-primary w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in to Admin"}
          </button>
        </form>

        <p className="mt-5 text-center type-caption text-[var(--color-text-muted)]">
          <Link to="/" className="text-brand-500 hover:underline">
            ← Back to {BRAND_NAME}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
