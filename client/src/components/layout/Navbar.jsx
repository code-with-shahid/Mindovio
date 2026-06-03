import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useSelector } from "react-redux"
import { HiChevronDown, HiArrowRightOnRectangle, HiClock, HiSparkles } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import ThemeToggle from "../ui/ThemeToggle"
import Button from "../ui/Button"

export function DashboardTopbar({ title, subtitle }) {
  const { userData } = useSelector((state) => state.user)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const credits = userData?.credits ?? 0

  const handleSignOut = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-30 glass-strong rounded-2xl px-5 py-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => navigate("/pricing")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:bg-brand-500/5 transition-colors"
          >
            <HiSparkles className="text-brand-500" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">{credits}</span>
            <span className="hidden sm:inline text-xs text-[var(--color-text-muted)]">credits</span>
          </button>

          <ThemeToggle />

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                {userData?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <HiChevronDown className="hidden sm:block text-[var(--color-text-muted)]" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-52 z-50 glass-strong rounded-xl py-2 shadow-xl"
                  >
                    <div className="px-4 py-2 border-b border-[var(--color-border)]">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{userData?.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{userData?.email}</p>
                    </div>
                    <MenuItem icon={<HiClock />} label="History" onClick={() => { setMenuOpen(false); navigate("/history") }} />
                    <MenuItem icon={<HiArrowRightOnRectangle />} label="Sign out" onClick={handleSignOut} danger />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-500/10"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
