import {
  HiStar,
  HiQuestionMarkCircle,
  HiFire,
  HiClock,
  HiRectangleStack,
  HiAcademicCap,
} from "react-icons/hi2"
import Card from "./ui/Card"
import Badge from "./ui/Badge"

export default function Sidebar({ result }) {
  if (
    !result ||
    !result.subTopics ||
    !result.questions ||
    !result.questions.short ||
    !result.questions.long
  ) {
    return null
  }

  const mcqCount = result.questions.mcqs?.length || 0
  const flashCount = result.flashcards?.length || 0
  const toc = result.tableOfContents?.length
    ? result.tableOfContents
    : ["Overview", "Concepts", "Visuals", "Exam practice", "Revision"]

  const jump = (label, i) => {
    const id = result.tableOfContents?.length ? `toc-${i}` : ["overview", "concepts", "visuals", "exam", "revision"][i]
    document.getElementById(id || "notes")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <Card glass className="space-y-5 lg:sticky lg:top-24 max-h-[min(50vh,24rem)] lg:max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="flex items-center gap-2">
        <HiStar className="text-brand-500" />
        <h3 className="font-semibold text-[var(--color-text-primary)]">Study navigator</h3>
      </div>

      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
        <div className="flex items-center gap-2 mb-1">
          <HiFire className="text-amber-500 text-sm" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Importance
          </span>
        </div>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">{result.importance}</p>
        {result.estimatedMinutes > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
            <HiClock /> ~{result.estimatedMinutes} min
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Jump to
        </p>
        <div className="space-y-1">
          {toc.slice(0, 8).map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => jump(label, i)}
              className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)] truncate"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Sub topics
        </p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(result.subTopics).map(([star, topics]) => (
            <div key={star} className="rounded-lg bg-[var(--color-surface-muted)] p-3">
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">{star}</p>
              <ul className="text-xs text-[var(--color-text-secondary)] space-y-0.5">
                {(topics || []).slice(0, 4).map((t, i) => (
                  <li key={i} className="truncate">• {t}</li>
                ))}
                {(topics || []).length > 4 && (
                  <li className="text-[var(--color-text-muted)]">+{topics.length - 4} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <HiQuestionMarkCircle className="text-[var(--color-text-muted)]" />
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Practice bank
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mcqCount > 0 && <Badge color="brand">{mcqCount} MCQs</Badge>}
          <Badge color="brand">{result.questions.short.length} Short</Badge>
          <Badge color="neutral">{result.questions.long.length} Long</Badge>
          {flashCount > 0 && (
            <Badge color="success">
              <HiRectangleStack className="text-[10px]" /> {flashCount} Cards
            </Badge>
          )}
          {result.questions.viva?.length > 0 && (
            <Badge color="neutral">
              <HiAcademicCap className="text-[10px]" /> {result.questions.viva.length} Viva
            </Badge>
          )}
          {result.questions.diagram && <Badge color="success">Diagram Q</Badge>}
        </div>
      </div>
    </Card>
  )
}
