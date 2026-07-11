import { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

export default function FormulaBlock({ name, latex, explanation }) {
  const html = useMemo(() => {
    if (!latex) return ""
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true })
    } catch {
      return latex
    }
  }, [latex])

  if (!latex) return null

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 space-y-2">
      {name && (
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{name}</p>
      )}
      <div
        className="overflow-x-auto py-2 text-[var(--color-text-primary)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {explanation && (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{explanation}</p>
      )}
    </div>
  )
}
