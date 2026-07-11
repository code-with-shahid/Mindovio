import { lazy, Suspense } from "react"
import AccordionSection from "./AccordionSection"

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((m) => ({ default: m.Prism }))
)

export default function CodePanel({ blocks = [] }) {
  if (!blocks.length) return null

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-elevated)]"
        >
          <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {block.language || "code"}
            </span>
            {block.complexity && (
              <span className="text-xs text-brand-600 dark:text-brand-400">{block.complexity}</span>
            )}
          </div>

          {block.explanation && (
            <p className="px-4 pt-3 text-sm text-[var(--color-text-secondary)]">{block.explanation}</p>
          )}

          <Suspense fallback={<pre className="p-4 text-xs overflow-x-auto">{block.code}</pre>}>
            <SyntaxHighlighter
              language={block.language || "javascript"}
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "transparent",
                fontSize: "0.8rem",
              }}
            >
              {block.code || ""}
            </SyntaxHighlighter>
          </Suspense>

          {block.output && (
            <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Output</p>
              <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">{block.output}</pre>
            </div>
          )}

          {(block.bestPractices?.length > 0 || block.mistakes?.length > 0) && (
            <div className="px-4 py-3 border-t border-[var(--color-border)]">
              <AccordionSection
                items={[
                  block.bestPractices?.length
                    ? { title: "Best practices", body: block.bestPractices }
                    : null,
                  block.mistakes?.length
                    ? { title: "Common mistakes", body: block.mistakes }
                    : null,
                ].filter(Boolean)}
                getTitle={(item) => item.title}
                getBody={(item) => (
                  <ul className="list-disc ml-5 space-y-1">
                    {item.body.map((line, j) => <li key={j}>{line}</li>)}
                  </ul>
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
