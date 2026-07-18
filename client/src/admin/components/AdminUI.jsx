import { motion } from "motion/react"

export function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="type-h2">{title}</h1>
        {subtitle && (
          <p className="type-sm mt-1 text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-glass rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="type-caption mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
            {value}
          </p>
          {hint && <p className="type-caption mt-1 text-[var(--color-text-muted)]">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/12 text-brand-500">
            <Icon size={18} />
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function Panel({ title, children, className = "" }) {
  return (
    <div className={`admin-glass rounded-2xl p-4 sm:p-5 ${className}`}>
      {title && <h2 className="type-h4 mb-4">{title}</h2>}
      {children}
    </div>
  )
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-skeleton h-28 rounded-2xl" />
      ))}
    </div>
  )
}

export function EmptyState({ text }) {
  return (
    <p className="type-sm py-8 text-center text-[var(--color-text-muted)]">{text}</p>
  )
}

export function ComingSoon({ feature }) {
  return (
    <Panel>
      <p className="type-h4 mb-2">{feature}</p>
      <p className="type-sm text-[var(--color-text-secondary)]">
        This section is scaffolded for Phase 2. Core admin controls are available from the
        sidebar (Users, Notes, Mock Tests, Analytics, etc.).
      </p>
    </Panel>
  )
}

export function DataTable({ columns, rows, empty = "No rows" }) {
  if (!rows?.length) return <EmptyState text={empty} />
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2.5 font-medium whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row._id || i}
              className="border-b border-[var(--color-border)]/70 hover:bg-[var(--color-surface-muted)]/50"
            >
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2.5 align-middle">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
