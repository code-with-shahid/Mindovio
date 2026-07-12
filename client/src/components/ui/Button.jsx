import { motion } from "motion/react"

const variants = {
  primary:
    "premium-btn-primary text-white shadow-lg shadow-brand-600/25",
  secondary:
    "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]",
  ghost:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]",
  outline:
    "border border-brand-500/40 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10",
}

const sizes = {
  sm: "px-3.5 py-2 text-[0.8125rem] rounded-lg tracking-[-0.01em]",
  md: "px-5 py-2.5 text-[0.875rem] rounded-xl tracking-[-0.01em]",
  lg: "px-7 py-3.5 text-[0.9375rem] rounded-xl tracking-[-0.015em]",
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.015 }}
      whileTap={disabled || loading ? {} : { scale: 0.985 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-colors duration-200 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="text-[1.05em] opacity-90">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
