import { Link } from "react-router-dom"
import { motion } from "motion/react"
import ThemeToggle from "../ui/ThemeToggle"
import logo from "../../assets/logo.png"

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="ExamNotesAI" className="h-9 w-9 rounded-lg" />
          <div>
            <span className="text-lg font-bold text-[var(--color-text-primary)]">
              ExamNotes<span className="text-brand-600 dark:text-brand-400">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] text-[var(--color-text-muted)]">
              AI Powered Smart Study Assistant
            </span>
          </div>
        </Link>
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
