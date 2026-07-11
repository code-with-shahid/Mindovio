const styles = {
  tip: {
    wrap: "border-emerald-500/30 bg-emerald-500/5",
    title: "text-emerald-700 dark:text-emerald-400",
    label: "Tip",
  },
  warning: {
    wrap: "border-amber-500/30 bg-amber-500/5",
    title: "text-amber-700 dark:text-amber-400",
    label: "Watch out",
  },
  info: {
    wrap: "border-sky-500/30 bg-sky-500/5",
    title: "text-sky-700 dark:text-sky-400",
    label: "Info",
  },
  success: {
    wrap: "border-brand-500/30 bg-brand-500/5",
    title: "text-brand-700 dark:text-brand-300",
    label: "Key idea",
  },
  important: {
    wrap: "border-rose-500/30 bg-rose-500/5",
    title: "text-rose-700 dark:text-rose-400",
    label: "Important",
  },
}

export default function Callout({ type = "info", title, content, children }) {
  const s = styles[type] || styles.info
  return (
    <div className={`rounded-2xl border px-4 py-3 ${s.wrap}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.title}`}>
        {s.label}{title ? ` · ${title}` : ""}
      </p>
      {content ? (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{content}</p>
      ) : null}
      {children}
    </div>
  )
}
