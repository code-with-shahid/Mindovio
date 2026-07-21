import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useSelector } from "react-redux"
import { Menu, X, Sparkles, Download } from "lucide-react"
import BrandLogo from "../ui/BrandLogo"
import ThemeToggle from "../ui/ThemeToggle"
import PremiumButton from "./motion/PremiumButton"
import { usePwaInstall } from "../../hooks/usePwaInstall"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
]

export default function LandingNavbar() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState("")
  const { showInstallOption, canInstall, isIosHint, install } = usePwaInstall()
  const [installHint, setInstallHint] = useState("")

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1))
    const observers = []

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(`#${id}`)
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

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

  const handleNav = (href) => {
    setMobileOpen(false)
    setActive(href)
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
  }

  const handleDownloadApp = async () => {
    setInstallHint("")
    const result = await install()
    if (result?.reason === "ios" || isIosHint) {
      setInstallHint("On iPhone: Share → Add to Home Screen")
      return
    }
    if (result?.reason === "unavailable") {
      setInstallHint("Use Chrome or Edge to install the app")
      return
    }
    if (result?.ok) setMobileOpen(false)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4"
    >
      <nav className="landing-navbar mx-auto max-w-7xl flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl min-w-0 overflow-hidden">
        <div className="relative min-w-0 flex-1 overflow-hidden pr-2">
          <span
            className="pointer-events-none absolute -inset-1 rounded-xl bg-[#7C5CFF]/20 blur-md opacity-80 max-md:hidden"
            aria-hidden
          />
          <BrandLogo showTagline className="hidden md:flex relative" />
          {/* Mobile: icon only on very narrow screens so theme controls never overlap */}
          <BrandLogo
            size="sm"
            className="md:hidden relative max-[420px]:[&>div]:hidden"
          />
        </div>

        <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium shrink-0">
          {navLinks.map(({ label, href }) => (
            <button
              key={href}
              type="button"
              onClick={() => handleNav(href)}
              className={`nav-link-premium transition-colors whitespace-nowrap ${active === href ? "is-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle className="shrink-0" />
          {userData ? (
            <PremiumButton size="sm" onClick={() => navigate("/dashboard")} icon={<Sparkles size={16} />}>
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">App</span>
            </PremiumButton>
          ) : (
            <>
              <PremiumButton
                size="sm"
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() => navigate("/login")}
              >
                Sign in
              </PremiumButton>
              <PremiumButton size="sm" onClick={() => navigate("/signup")} className="shrink-0">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </PremiumButton>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 shrink-0"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 top-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.div
              id="landing-mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden relative z-50 mx-auto max-w-7xl mt-2 landing-navbar rounded-2xl p-3 sm:p-4 max-h-[min(70vh,28rem)] overflow-y-auto"
            >
              {navLinks.map(({ label, href }) => (
                <button
                  key={href}
                  type="button"
                  onClick={() => handleNav(href)}
                  className={`block w-full text-left px-3 py-3 text-sm font-medium rounded-xl transition-colors ${
                    active === href
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-300"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
              {showInstallOption && (
                <>
                  <div className="my-2 border-t border-[var(--color-border)]" />
                  <button
                    type="button"
                    onClick={handleDownloadApp}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                  >
                    <Download size={18} className="shrink-0 text-brand-500" />
                    {canInstall ? "Download App" : "Install App"}
                  </button>
                  {installHint && (
                    <p className="px-3 pb-2 text-xs text-[var(--color-text-muted)]">
                      {installHint}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
