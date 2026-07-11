export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[16rem]">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
          <Icon className="text-2xl text-brand-600 dark:text-brand-400" />
        </div>
      )}
      <p className="text-[var(--color-text-primary)] font-medium">{title}</p>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
