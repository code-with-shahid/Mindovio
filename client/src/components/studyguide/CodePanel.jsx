import { lazy, Suspense, useState } from "react"
import { HiClipboardDocument, HiCheck } from "react-icons/hi2"
import AccordionSection from "./AccordionSection"

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((m) => ({ default: m.Prism }))
)

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 type-caption hover:text-primary transition-colors"
    >
      {copied ? <HiCheck className="text-success" /> : <HiClipboardDocument />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export default function CodePanel({ blocks = [] }) {
  if (!blocks.length) return null

  return (
    <div className="stack-md">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-elevated)]"
        >
          <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] flex items-center justify-between gap-3">
            <span className="type-overline">
              {block.language || "code"}
            </span>
            <div className="flex items-center gap-3">
              {block.complexity && (
                <span className="type-caption text-brand-600 dark:text-brand-400">{block.complexity}</span>
              )}
              <CopyButton code={block.code} />
            </div>
          </div>

          {block.explanation && (
            <p className="px-4 pt-3.5 type-sm">{block.explanation}</p>
          )}

          <Suspense
            fallback={
              <pre className="p-4 type-mono text-secondary overflow-x-auto">{block.code}</pre>
            }
          >
            <div className="text-[0.8125rem] leading-[1.65]">
              <SyntaxHighlighter
                language={block.language || "javascript"}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: "1.1rem 1rem",
                  background: "transparent",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8125rem",
                  lineHeight: 1.65,
                }}
                lineNumberStyle={{
                  minWidth: "2.25em",
                  paddingRight: "1em",
                  color: "var(--color-text-muted)",
                  opacity: 0.7,
                }}
              >
                {block.code || ""}
              </SyntaxHighlighter>
            </div>
          </Suspense>

          {block.output && (
            <div className="px-4 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <p className="type-overline mb-1.5">Output</p>
              <pre className="type-mono text-secondary whitespace-pre-wrap">{block.output}</pre>
            </div>
          )}

          {(block.bestPractices?.length > 0 || block.mistakes?.length > 0) && (
            <div className="px-4 py-3.5 border-t border-[var(--color-border)]">
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
                  <ul className="list-disc ml-5 stack-xs type-sm">
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
