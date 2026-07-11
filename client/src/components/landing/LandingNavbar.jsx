import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useSelector } from "react-redux"
import { HiBars3, HiXMark, HiSparkles } from "react-icons/hi2"
import ThemeToggle from "../ui/ThemeToggle"
import Button from "../ui/Button"
import BrandLogo from "../ui/BrandLogo"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
]

export default function LandingNavbar() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (href) => {
    setMobileOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4"
    >
      <nav className="glass-strong mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-5 py-3 rounded-2xl">
        <BrandLogo showTagline className="hidden sm:flex" />
        <BrandLogo size="sm" className="sm:hidden" />

        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-[var(--color-text-secondary)]">
          {navLinks.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNav(href)}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {userData ? (
            <Button size="sm" onClick={() => navigate("/dashboard")} icon={<HiSparkles />}>
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">App</span>
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>
                Get Started
              </Button>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiXMark className="text-xl" /> : <HiBars3 className="text-xl" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden mx-auto max-w-7xl mt-2 glass-strong rounded-2xl p-4 shadow-xl"
          >
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => handleNav(href)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
