import { HiStar, HiQuestionMarkCircle, HiFire } from "react-icons/hi2"
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

  return (
    <Card glass className="space-y-5 sticky top-24">
      <div className="flex items-center gap-2">
        <HiStar className="text-brand-500" />
        <h3 className="font-semibold text-[var(--color-text-primary)]">Quick Exam View</h3>
      </div>

      {/* Importance */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
        <div className="flex items-center gap-2 mb-1">
          <HiFire className="text-amber-500 text-sm" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Importance</span>
        </div>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">{result.importance}</p>
      </div>

      {/* Sub topics */}
      <div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Sub Topics
        </p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Object.entries(result.subTopics).map(([star, topics]) => (
            <div key={star} className="rounded-lg bg-[var(--color-surface-muted)] p-3">
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">{star}</p>
              <ul className="text-xs text-[var(--color-text-secondary)] space-y-0.5">
                {topics.slice(0, 4).map((t, i) => <li key={i} className="truncate">• {t}</li>)}
                {topics.length > 4 && (
                  <li className="text-[var(--color-text-muted)]">+{topics.length - 4} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Questions summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <HiQuestionMarkCircle className="text-[var(--color-text-muted)]" />
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Questions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge color="brand">{result.questions.short.length} Short</Badge>
          <Badge color="neutral">{result.questions.long.length} Long</Badge>
          {result.questions.diagram && <Badge color="success">Diagram Q</Badge>}
        </div>
      </div>
    </Card>
  )
}
