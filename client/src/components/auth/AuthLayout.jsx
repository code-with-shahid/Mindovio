import { motion } from "motion/react"
import ThemeToggle from "../ui/ThemeToggle"
import BrandLogo from "../ui/BrandLogo"

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <BrandLogo showTagline />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
            )}
          </div>
          {children}
        </motion.div>
      </main>
    </div>
  )
}
