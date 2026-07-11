import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { HiArrowDownTray, HiBolt, HiExclamationTriangle } from "react-icons/hi2"
import MermaidSetup from "./MermaidSetup"
import RechartSetUp from "./RechartSetUp"
import { downloadPdf } from "../services/api"
import Button from "./ui/Button"
import Badge from "./ui/Badge"
import EmptyState from "./ui/EmptyState"

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-6 mb-4 border-b border-[var(--color-border)] pb-2">
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
    <ul className="list-disc ml-6 space-y-1 text-[var(--color-text-secondary)]">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="marker:text-brand-500">{children}</li>
  ),
}

export default function FinalResult({ result }) {
  const [quickRevision, setQuickRevision] = useState(false)

  if (
    !result ||
    !result.subTopics ||
    !result.questions ||
    !result.questions.short ||
    !result.questions.long ||
    !result.revisionPoints
  ) {
    return (
      <EmptyState
        icon={HiExclamationTriangle}
        title="Incomplete note data"
        description="This note is missing required sections and can’t be displayed."
      />
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Generated Notes</h2>
          {result.importance && (
            <Badge color="warning" className="mt-2">
              Importance: {result.importance}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={quickRevision ? "primary" : "outline"}
            size="sm"
            icon={<HiBolt />}
            onClick={() => setQuickRevision(!quickRevision)}
          >
            {quickRevision ? "Full View" : "Quick Revision"}
          </Button>
          <Button size="sm" icon={<HiArrowDownTray />} onClick={() => downloadPdf(result)}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Sub Topics */}
      {!quickRevision && (
        <Section title="Sub Topics" subtitle="Priority-wise breakdown">
          {Object.entries(result.subTopics).map(([star, topics]) => (
            <div key={star} className="mb-4">
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-2">{star} Priority</p>
              <ul className="list-disc ml-6 space-y-1 text-sm text-[var(--color-text-secondary)]">
                {topics.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Notes */}
      {!quickRevision && (
        <Section title="Detailed Notes">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
            <ReactMarkdown components={markdownComponents}>{result.notes}</ReactMarkdown>
          </div>
        </Section>
      )}

      {/* Revision */}
      {quickRevision && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <HiBolt /> Quick Revision Points
          </h3>
          <ul className="list-disc ml-6 space-y-2 text-sm text-[var(--color-text-secondary)]">
            {result.revisionPoints.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {/* Diagram */}
      {result.diagram?.data && (
        <Section title="Diagram">
          <MermaidSetup diagram={result.diagram.data} />
        </Section>
      )}

      {/* Charts */}
      {result.charts?.length > 0 && (
        <Section title="Visual Charts">
          <RechartSetUp charts={result.charts} />
        </Section>
      )}

      {/* Questions */}
      <Section title="Important Questions">
        <QuestionBlock label="Short Questions" items={result.questions.short} />
        <QuestionBlock label="Long Questions" items={result.questions.long} className="mt-4" />
        {result.questions.diagram && (
          <div className="mt-4">
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Diagram Question</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{result.questions.diagram}</p>
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--color-text-muted)] mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </section>
  )
}

function QuestionBlock({ label, items, className = "" }) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{label}</p>
      <ul className="list-disc ml-6 space-y-1 text-sm text-[var(--color-text-secondary)]">
        {items.map((q, i) => <li key={i}>{q}</li>)}
      </ul>
    </div>
  )
}
