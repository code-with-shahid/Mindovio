import { HiMoon, HiSun } from "react-icons/hi2"
import { useTheme } from "../../context/ThemeContext"
import { motion } from "motion/react"

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`
        flex h-9 w-9 items-center justify-center rounded-xl
        border border-[var(--color-border)] bg-[var(--color-surface-elevated)]
        text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
        transition-colors duration-200 ${className}
      `}
    >
      {theme === "light" ? <HiMoon className="text-lg" /> : <HiSun className="text-lg" />}
    </motion.button>
  )
}
