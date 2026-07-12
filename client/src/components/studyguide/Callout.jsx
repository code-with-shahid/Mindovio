const styles = {
  tip: {
    wrap: "border-emerald-500/30 bg-emerald-500/5",
    title: "text-success",
    label: "Tip",
  },
  warning: {
    wrap: "border-amber-500/30 bg-amber-500/5",
    title: "text-warning",
    label: "Watch out",
  },
  info: {
    wrap: "border-sky-500/30 bg-sky-500/5",
    title: "text-info",
    label: "Info",
  },
  success: {
    wrap: "border-brand-500/30 bg-brand-500/5",
    title: "text-brand-700 dark:text-brand-300",
    label: "Key idea",
  },
  important: {
    wrap: "border-rose-500/30 bg-rose-500/5",
    title: "text-error",
    label: "Important",
  },
}

export default function Callout({ type = "info", title, content, children }) {
  const s = styles[type] || styles.info
  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${s.wrap}`}>
      <p className={`type-overline mb-1.5 ${s.title}`}>
        {s.label}{title ? ` · ${title}` : ""}
      </p>
      {content ? (
        <p className="type-sm leading-relaxed">{content}</p>
      ) : null}
      {children}
    </div>
  )
}
