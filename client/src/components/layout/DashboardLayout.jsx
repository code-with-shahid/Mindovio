import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { HiDocumentText, HiClock, HiCreditCard, HiHome, HiBars3, HiXMark } from "react-icons/hi2"
import { useState } from "react"
import logo from "../../assets/logo.png"

const navItems = [
  { path: "/", label: "Home", icon: HiHome },
  { path: "/dashboard", label: "Generate", icon: HiDocumentText, aliases: ["/notes"] },
  { path: "/history", label: "History", icon: HiClock },
  { path: "/pricing", label: "Credits", icon: HiCreditCard },
]

function isActive(pathname, item) {
  if (item.aliases?.includes(pathname)) return true
  return pathname === item.path
}

export default function DashboardLayout({ children, title, subtitle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen mesh-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl p-5 z-40">
        <Link to="/" className="flex items-center gap-2.5 mb-8 px-2">
          <img src={logo} alt="ExamNotes AI" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-bold text-[var(--color-text-primary)]">
            ExamNotes<span className="text-brand-600 dark:text-brand-400">.AI</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ path, label, icon: Icon, aliases }) => {
            const active = isActive(location.pathname, { path, aliases })
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
                  }
                `}
              >
                <Icon className="text-lg" />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="glass rounded-xl p-4 mt-auto">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Pro tip</p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Enable revision mode for last-day exam prep.
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-bold text-[var(--color-text-primary)]">ExamNotes.AI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
        >
          {mobileOpen ? <HiXMark className="text-xl" /> : <HiBars3 className="text-xl" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <motion.nav
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--color-surface-elevated)] p-5 pt-16 border-r border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map(({ path, label, icon: Icon, aliases }) => (
              <button
                key={path}
                onClick={() => { navigate(path); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium mb-1 ${
                  isActive(location.pathname, { path, aliases })
                    ? "bg-brand-600 text-white"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                <Icon className="text-lg" />
                {label}
              </button>
            ))}
          </motion.nav>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
