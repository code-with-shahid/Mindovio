import { motion } from "motion/react"
import ThemeToggle from "../ui/ThemeToggle"
import BrandLogo from "../ui/BrandLogo"
import AmbientBackground from "../landing/motion/AmbientBackground"

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="app-shell relative flex flex-col min-h-dvh overflow-x-clip">
      <AmbientBackground variant="app" />
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5">
        <BrandLogo showTagline className="hidden sm:flex" />
        <BrandLogo size="sm" className="sm:hidden" />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-3 sm:px-6 py-6 sm:py-8 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md min-w-0"
        >
          <div className="premium-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="type-h1 mb-2 text-[var(--color-text-primary)]">{title}</h1>
              {subtitle && (
                <p className="type-body text-[var(--color-text-secondary)] text-balance">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
