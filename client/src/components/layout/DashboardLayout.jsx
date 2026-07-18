import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Home, FileText, Clock, CreditCard, ClipboardList, Menu, X } from "lucide-react"
import BrandLogo from "../ui/BrandLogo"
import AmbientBackground from "../landing/motion/AmbientBackground"
import AnnouncementBanner from "../AnnouncementBanner"

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Generate", icon: FileText, aliases: ["/notes"] },
  { path: "/history", label: "History", icon: Clock },
  { path: "/mock-tests", label: "Mock Tests", icon: ClipboardList, aliases: ["/mock-test"] },
  { path: "/pricing", label: "Credits", icon: CreditCard },
]

function isActive(pathname, item) {
  if (item.aliases?.some((a) => pathname === a || pathname.startsWith(`${a}/`))) return true
  return pathname === item.path
}

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [mobileOpen])

  return (
    <div className="app-shell relative overflow-x-clip">
      <AmbientBackground variant="app" />

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 xl:w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)]/75 backdrop-blur-xl p-4 xl:p-5 z-40">
        <BrandLogo showTagline className="mb-6 xl:mb-8 px-1 xl:px-2" />

        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Dashboard">
          {navItems.map(({ path, label, icon: Icon, aliases }) => {
            const active = isActive(location.pathname, { path, aliases })
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "premium-btn-primary text-white shadow-lg shadow-[#7C5CFF]/30"
                      : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                  }
                `}
              >
                <Icon size={18} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="premium-card rounded-xl p-3 xl:p-4 mt-auto">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Pro tip
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Enable revision mode for last-day exam prep.
          </p>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 landing-navbar border-b border-[var(--color-border)] px-3 sm:px-4 py-3 flex items-center justify-between rounded-none safe-top">
        <BrandLogo size="sm" />
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-dashboard-nav"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            role="presentation"
          >
            <motion.nav
              id="mobile-dashboard-nav"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 bottom-0 w-[min(18rem,88vw)] bg-[var(--color-surface-elevated)] p-5 pt-16 border-r border-[var(--color-border)] shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              aria-label="Mobile navigation"
            >
              <BrandLogo showTagline className="mb-6" />
              {navItems.map(({ path, label, icon: Icon, aliases }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => {
                    navigate(path)
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium mb-1 ${
                    isActive(location.pathname, { path, aliases })
                      ? "premium-btn-primary text-white"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {label}
                </button>
              ))}
            </motion.nav>
          </div>
        )}
      </AnimatePresence>

      <main className="relative z-10 lg:pl-56 xl:pl-64 min-h-screen min-w-0">
        <div className="px-3 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 pt-[4.25rem] lg:pt-8 max-w-7xl 2xl:max-w-[90rem] mx-auto w-full min-w-0">
          <AnnouncementBanner className="mb-5" includeNotifications limit={5} />
          {children}
        </div>
      </main>
    </div>
  )
}
