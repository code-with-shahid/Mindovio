import { useEffect, useMemo, useRef, useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  UserCircle,
  Users,
  ClipboardList,
  ScrollText,
  X,
} from "lucide-react"
import { useAdminAuth } from "../context/AdminAuthContext"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../context/ToastContext"
import { searchAdmin } from "../services/adminApi"
import { BRAND_NAME } from "../../constants/brand"

const NAV = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/ai-usage", label: "AI Usage", icon: Brain },
  { to: "/admin/notes", label: "Generated Notes", icon: FileText },
  { to: "/admin/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reports", label: "Reports", icon: ScrollText },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/logs", label: "Logs", icon: Activity },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
]

const INACTIVITY_MS = 30 * 60 * 1000
const WARN_BEFORE_MS = 60 * 1000

export default function AdminShell() {
  const { admin, logout } = useAdminAuth()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [q, setQ] = useState("")
  const [results, setResults] = useState(null)
  const lastActive = useRef(Date.now())
  const warned = useRef(false)

  useEffect(() => {
    const bump = () => {
      lastActive.current = Date.now()
      warned.current = false
    }
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }))
    const tick = setInterval(async () => {
      const idle = Date.now() - lastActive.current
      if (idle >= INACTIVITY_MS - WARN_BEFORE_MS && !warned.current) {
        warned.current = true
        toast("You'll be logged out soon due to inactivity", "info")
      }
      if (idle >= INACTIVITY_MS) {
        await logout()
        toast("Logged out due to inactivity", "info")
        navigate("/admin/login", { replace: true })
      }
    }, 15000)
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump))
      clearInterval(tick)
    }
  }, [logout, navigate, toast])

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    const t = setTimeout(async () => {
      try {
        setResults(await searchAdmin(q.trim()))
      } catch {
        setResults(null)
      }
    }, 280)
    return () => clearTimeout(t)
  }, [q])

  const sidebar = useMemo(
    () => (
      <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin navigation">
        {NAV.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-500/15 text-brand-600 dark:text-brand-300"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    ),
    []
  )

  const handleLogout = async () => {
    await logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="admin-shell min-h-dvh bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]">
      <aside className="admin-sidebar hidden lg:flex lg:flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl">
        <div className="border-b border-[var(--color-border)] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">Admin</p>
          <p className="font-bold text-[var(--color-text-primary)]">{BRAND_NAME}</p>
          <p className="type-caption truncate mt-1">{admin?.email}</p>
        </div>
        <div className="flex-1 overflow-y-auto">{sidebar}</div>
        <div className="border-t border-[var(--color-border)] p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <div className="admin-main flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/85 px-3 py-3 backdrop-blur-xl sm:px-5">
          <button
            type="button"
            className="rounded-xl p-2 lg:hidden hover:bg-[var(--color-surface-muted)]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="relative flex-1 max-w-xl">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              className="ui-input !py-2 pl-9"
              placeholder="Search users, notes, tests…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Global search"
            />
            <AnimatePresence>
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 shadow-xl z-50"
                >
                  <SearchGroup title="Users" items={results.users} render={(u) => (
                    <Link to="/admin/users" onClick={() => setQ("")} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--color-surface-muted)]">
                      {u.name} · {u.email}
                    </Link>
                  )} />
                  <SearchGroup title="Notes" items={results.notes} render={(n) => (
                    <Link to="/admin/notes" onClick={() => setQ("")} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--color-surface-muted)]">
                      {n.topic}
                    </Link>
                  )} />
                  <SearchGroup title="Mock tests" items={results.mockTests} render={(m) => (
                    <Link to="/admin/mock-tests" onClick={() => setQ("")} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--color-surface-muted)]">
                      {m.topic} · {m.status}
                    </Link>
                  )} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2 hover:bg-[var(--color-surface-muted)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-semibold"
          >
            <LogOut size={14} /> Logout
          </button>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-6 min-w-0">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--color-surface-elevated)] border-r border-[var(--color-border)] lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
                <span className="font-bold">{BRAND_NAME} Admin</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebar}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchGroup({ title, items, render }) {
  if (!items?.length) return null
  return (
    <div className="mb-2">
      <p className="px-2 py-1 type-caption font-semibold">{title}</p>
      {items.map((item, i) => (
        <div key={item._id || i}>{render(item)}</div>
      ))}
    </div>
  )
}
