import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { HiDocumentText, HiClock, HiCreditCard, HiHome, HiBars3, HiXMark } from "react-icons/hi2"
import { useState } from "react"
import BrandLogo from "../ui/BrandLogo"

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

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen mesh-bg">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl p-5 z-40">
        <BrandLogo showTagline className="mb-8 px-2" />

        <nav className="flex-1 space-y-1" aria-label="Dashboard">
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

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <BrandLogo size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <HiXMark className="text-xl" /> : <HiBars3 className="text-xl" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--color-surface-elevated)] p-5 pt-16 border-r border-[var(--color-border)]"
              onClick={(e) => e.stopPropagation()}
              aria-label="Mobile navigation"
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
      </AnimatePresence>

      <main className="lg:pl-64 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
