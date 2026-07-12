import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Flag,
  Send,
  SkipForward,
} from "lucide-react"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Alert from "../components/ui/Alert"
import { getMockTest, startMockTest, submitMockTest } from "../services/api"
import { useToast } from "../context/ToastContext"
import MockTestResults from "../components/mocktest/MockTestResults"

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
}

function QuestionBody({ question, value, onChange }) {
  const type = question?.type || "mcq"

  if (type === "mcq" || type === "true_false" || type === "scenario" || type === "assertion_reason" || type === "diagram") {
    const opts =
      question.options?.length > 0
        ? question.options
        : type === "true_false"
          ? ["True", "False"]
          : []
    return (
      <div className="space-y-2.5">
        {question.diagramHint && (
          <p className="type-sm rounded-xl border border-brand-500/20 bg-brand-500/5 px-3 py-2 text-brand-600 dark:text-brand-300">
            Diagram cue: {question.diagramHint}
          </p>
        )}
        {opts.map((opt) => {
          const selected = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                selected
                  ? "border-brand-500 bg-brand-500/15 text-[var(--color-text-primary)] shadow-sm"
                  : "border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 hover:border-brand-500/40"
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    )
  }

  if (type === "fill_blank" || type === "one_word") {
    return (
      <input
        className="ui-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={type === "fill_blank" ? "Type the missing word…" : "One-word answer…"}
      />
    )
  }

  if (type === "match") {
    const left = question.matchLeft || []
    const right = question.matchRight || []
    const map = typeof value === "object" && value ? value : {}
    return (
      <div className="space-y-3">
        {left.map((item) => (
          <div key={item} className="grid sm:grid-cols-2 gap-2 items-center">
            <div className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm font-medium">
              {item}
            </div>
            <select
              className="ui-input"
              value={map[item] || ""}
              onChange={(e) => onChange({ ...map, [item]: e.target.value })}
            >
              <option value="">Match with…</option>
              {right.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    )
  }

  return (
    <textarea
      className="ui-input min-h-[100px]"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer…"
    />
  )
}

export default function MockTestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [meta, setMeta] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState([])
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [resultPayload, setResultPayload] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const data = await getMockTest(testId)
        if (!alive) return
        if (data.status === "submitted") {
          setResultPayload(data)
          setMeta(data)
          setLoading(false)
          return
        }
        await startMockTest(testId)
        const fresh = await getMockTest(testId)
        if (!alive) return
        setMeta(fresh)
        setQuestions(fresh.questions || [])
        setAnswers(fresh.answers || {})
        setFlagged(fresh.flagged || [])
        setRemaining(fresh.timeLimitSec || (fresh.questions?.length || 10) * 90)
        setLoading(false)
      } catch (e) {
        if (!alive) return
        setError(e?.response?.data?.message || "Could not load mock test")
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [testId])

  useEffect(() => {
    if (resultPayload || loading || !questions.length) return
    const t = setInterval(() => {
      setElapsed((e) => e + 1)
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t)
          handleSubmit(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, resultPayload, questions.length])

  const current = questions[index]
  const answeredCount = useMemo(
    () =>
      questions.filter((q) => {
        const v = answers[q.id]
        if (v == null || v === "") return false
        if (typeof v === "object") return Object.keys(v).length > 0
        return true
      }).length,
    [answers, questions]
  )

  const progressPct = questions.length
    ? Math.round(((index + 1) / questions.length) * 100)
    : 0

  const setAnswer = (val) => {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: val }))
  }

  const toggleFlag = () => {
    if (!current) return
    setFlagged((f) =>
      f.includes(current.id) ? f.filter((id) => id !== current.id) : [...f, current.id]
    )
  }

  const handleSubmit = async (auto = false) => {
    if (submitting || resultPayload) return
    setSubmitting(true)
    try {
      const data = await submitMockTest(testId, {
        answers,
        flagged,
        timeTakenSec: elapsed || meta?.timeLimitSec - remaining,
      })
      setResultPayload(data)
      toast(auto ? "Time’s up — test submitted" : "Test submitted!", auto ? "info" : "success")
    } catch (e) {
      toast(e?.response?.data?.message || "Submit failed", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardTopbar title="Mock Test" subtitle="Loading your personalized test…" />
        <Card className="p-10 text-center type-sm text-[var(--color-text-muted)] animate-pulse">
          Preparing questions…
        </Card>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardTopbar title="Mock Test" subtitle="Something went wrong" />
        <Alert variant="error">{error}</Alert>
        <Button className="mt-4" variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </DashboardLayout>
    )
  }

  if (resultPayload) {
    return (
      <DashboardLayout>
        <DashboardTopbar
          title="Mock Test Results"
          subtitle={resultPayload.topic || meta?.topic}
        />
        <MockTestResults
          data={resultPayload}
          noteId={resultPayload.noteId || meta?.noteId}
        />
      </DashboardLayout>
    )
  }

  const statusFor = (q) => {
    const v = answers[q.id]
    const has =
      v != null &&
      v !== "" &&
      !(typeof v === "object" && !Object.keys(v).length)
    if (flagged.includes(q.id)) return "flagged"
    if (has) return "answered"
    return "unseen"
  }

  return (
    <DashboardLayout>
      <DashboardTopbar
        title={meta?.topic || "Mock Test"}
        subtitle={`${meta?.difficulty || "mixed"} · ${questions.length} questions`}
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] gap-4 sm:gap-5 min-w-0">
        <div className="space-y-4 min-w-0 order-1">
          <Card className="!p-3 sm:!p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="type-sm font-medium">
                Question {index + 1} of {questions.length}
              </p>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
                  remaining < 60
                    ? "bg-rose-500/15 text-rose-500"
                    : "bg-brand-500/10 text-brand-600 dark:text-brand-300"
                }`}
              >
                <Clock size={14} />
                {formatTime(remaining)}
              </div>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#4F8BFF]"
                initial={false}
                animate={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="type-caption mt-2">
              Answered {answeredCount}/{questions.length}
            </p>
          </Card>

          {current ? (
            <Card className="premium-card !p-4 sm:!p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-caption px-2.5 py-1 rounded-full border border-[var(--color-border)] uppercase tracking-wide">
                  {String(current.type || "mcq").replace(/_/g, " ")}
                </span>
                <span className="type-caption px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 capitalize">
                  {current.difficulty || "medium"}
                </span>
                {current.topicTag && (
                  <span className="type-caption text-[var(--color-text-muted)]">
                    {current.topicTag}
                  </span>
                )}
              </div>
              <h2 className="type-h3 leading-snug">{current.prompt || "Untitled question"}</h2>
              <QuestionBody
                question={current}
                value={answers[current.id]}
                onChange={setAnswer}
              />
            </Card>
          ) : (
            <Card className="!p-6">
              <p className="type-sm text-[var(--color-text-muted)]">
                No questions loaded for this test. Go back and generate a new mock test.
              </p>
            </Card>
          )}

          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                icon={<ArrowLeft size={16} />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                icon={<SkipForward size={16} />}
              >
                Skip
              </Button>
              <Button
                variant={flagged.includes(current?.id) ? "primary" : "outline"}
                onClick={toggleFlag}
                icon={<Flag size={16} />}
              >
                Review later
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {index < questions.length - 1 ? (
                <Button
                  onClick={() => setIndex((i) => i + 1)}
                  icon={<ArrowRight size={16} />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  loading={submitting}
                  icon={<Send size={16} />}
                >
                  Submit test
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card className="!p-4 h-fit lg:sticky lg:top-24 order-2 min-w-0">
          <p className="type-label mb-3 flex items-center gap-2">
            <Bookmark size={14} /> Question palette
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 mb-4">
            {questions.map((q, i) => {
              const st = statusFor(q)
              const colors = {
                answered: "bg-emerald-500 text-white",
                flagged: "bg-amber-500 text-white",
                unseen: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
              }
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-9 rounded-lg text-xs font-semibold ${colors[st]} ${
                    i === index ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-[var(--color-surface-elevated)]" : ""
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <ul className="space-y-1.5 type-caption text-[var(--color-text-muted)]">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Answered
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Review later
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-border)]" /> Not visited
            </li>
          </ul>
          <Button
            className="w-full mt-4"
            onClick={() => handleSubmit(false)}
            loading={submitting}
            icon={<CheckCircle2 size={16} />}
          >
            Submit test
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
