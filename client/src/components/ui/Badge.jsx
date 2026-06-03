const colors = {
  brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  neutral: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
}

export default function Badge({ children, color = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${colors[color]} ${className}`}
    >
      {children}
    </span>
  )
}
