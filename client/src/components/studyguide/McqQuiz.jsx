import { useState } from "react"
import { HiCheckCircle, HiXCircle } from "react-icons/hi2"
import Button from "../ui/Button"

export default function McqQuiz({ mcqs = [] }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  if (!mcqs.length) return null

  const q = mcqs[index]
  const options = Array.isArray(q.options) ? q.options : []

  const isAnswerMatch = (opt) =>
    opt === q.answer || String(opt).trim() === String(q.answer).trim()

  const check = () => {
    if (selected == null) return
    setRevealed(true)
    if (isAnswerMatch(selected)) setScore((s) => s + 1)
  }

  const next = () => {
    if (index >= mcqs.length - 1) {
      setDone(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-6 text-center">
        <p className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Quiz complete</p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          You scored {score} / {mcqs.length}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setIndex(0)
            setSelected(null)
            setRevealed(false)
            setScore(0)
            setDone(false)
          }}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>MCQ {index + 1} / {mcqs.length}</span>
        <span>Score {score}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed">{q.q}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isSel = selected === opt
          const isCorrect = revealed && isAnswerMatch(opt)
          const isWrong = revealed && isSel && !isCorrect
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => setSelected(opt)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                isCorrect
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : isWrong
                    ? "border-red-500/50 bg-red-500/10"
                    : isSel
                      ? "border-brand-500/50 bg-brand-500/10"
                      : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              <span className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                {isCorrect && <HiCheckCircle className="text-emerald-500 shrink-0 mt-0.5" />}
                {isWrong && <HiXCircle className="text-red-500 shrink-0 mt-0.5" />}
                {opt}
              </span>
            </button>
          )
        })}
      </div>
      {revealed && q.explanation && (
        <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] rounded-xl px-4 py-3">
          {q.explanation}
        </p>
      )}
      <div className="flex gap-2">
        {!revealed ? (
          <Button size="sm" disabled={selected == null} onClick={check}>Check answer</Button>
        ) : (
          <Button size="sm" onClick={next}>{index >= mcqs.length - 1 ? "Finish" : "Next"}</Button>
        )}
      </div>
    </div>
  )
}
