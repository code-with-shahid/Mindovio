import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

const components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-6 mb-3 pb-2 border-b border-[var(--color-border)]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-brand-600 dark:text-brand-400 mt-5 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc ml-6 space-y-1.5 text-[var(--color-text-secondary)] mb-3">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-6 space-y-1.5 text-[var(--color-text-secondary)] mb-3">{children}</ol>
  ),
  li: ({ children }) => <li className="marker:text-brand-500">{children}</li>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-[var(--color-border)]">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 bg-[var(--color-surface-muted)] text-left font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
      {children}
    </td>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-")
    if (isBlock) {
      return (
        <code className="block text-xs overflow-x-auto p-3 rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]">
          {children}
        </code>
      )
    }
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-brand-600 dark:text-brand-400 text-[0.85em]">
        {children}
      </code>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-500/50 pl-4 my-3 text-[var(--color-text-secondary)] italic">
      {children}
    </blockquote>
  ),
}

export default function MarkdownBody({ content }) {
  if (!content) return null
  return (
    <div className="study-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
