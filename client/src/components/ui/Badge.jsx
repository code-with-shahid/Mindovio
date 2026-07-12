const colors = {
  brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
  success: "bg-emerald-500/10 text-success border-emerald-500/20",
  warning: "bg-amber-500/10 text-warning border-amber-500/20",
  neutral: "bg-[var(--color-surface-muted)] text-secondary border-[var(--color-border)]",
  error: "bg-red-500/10 text-error border-red-500/20",
  info: "bg-sky-500/10 text-info border-sky-500/20",
}

export default function Badge({ children, color = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 type-caption rounded-full border ${colors[color] || colors.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
