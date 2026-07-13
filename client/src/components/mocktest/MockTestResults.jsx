import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"
import {
  Award,
  BookOpen,
  Download,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { generateMockTest, getMockTest } from "../../services/api"
import { updateCredits } from "../../redux/userSlice"
import { useToast } from "../../context/ToastContext"

const DIFFICULTY_ORDER = ["easy", "medium", "hard"]

function nextDifficulty(current) {
  if (current === "mixed") return "hard"
  const i = DIFFICULTY_ORDER.indexOf(current)
  return DIFFICULTY_ORDER[Math.min(DIFFICULTY_ORDER.length - 1, Math.max(0, i) + 1)]
}

function formatDuration(sec = 0) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function MockTestResults({ data, noteId }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { toast } = useToast()
  const [regenLoading, setRegenLoading] = useState(null)
  const [feedback, setFeedback] = useState(data.feedback || {})
  const [feedbackStatus, setFeedbackStatus] = useState(data.feedbackStatus || "ready")
  const score = data.score || {}
  const results = data.results || {}
  const radar = results.radar || []
  const perQuestion = results.perQuestion || []
  const badges = data.badges || []
  const resolvedNoteId = noteId || data.noteId
  const testId = data.testId

  useEffect(() => {
    setFeedback(data.feedback || {})
    setFeedbackStatus(data.feedbackStatus || "ready")
  }, [data.feedback, data.feedbackStatus, data.testId])

  // Poll for richer Gemini feedback after fast submit
  useEffect(() => {
    if (!testId || feedbackStatus !== "pending") return
    let tries = 0
    let cancelled = false
    const tick = async () => {
      tries += 1
      try {
        const fresh = await getMockTest(testId)
        if (cancelled) return
        if (fresh.feedbackStatus === "ready" && fresh.feedback) {
          setFeedback(fresh.feedback)
          setFeedbackStatus("ready")
          return
        }
        if (fresh.feedbackStatus === "failed") {
          setFeedbackStatus("failed")
          return
        }
      } catch {
        /* keep provisional feedback */
      }
      if (!cancelled && tries < 20) {
        timer = setTimeout(tick, 2000)
      } else if (!cancelled) {
        setFeedbackStatus((s) => (s === "pending" ? "failed" : s))
      }
    }
    let timer = setTimeout(tick, 1500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [testId, feedbackStatus])

  const regenerate = async (mode) => {
    if (!resolvedNoteId) {
      toast("Open this topic’s notes to generate a new mock test", "info")
      navigate("/dashboard")
      return
    }
    const questionCount = [10, 20, 30, 50].includes(data.questionCount)
      ? data.questionCount
      : 10
    let difficulty = data.difficulty || "mixed"
    if (mode === "harder") difficulty = nextDifficulty(difficulty)
    setRegenLoading(mode)
    try {
      const res = await generateMockTest({
        noteId: resolvedNoteId,
        difficulty,
        questionCount,
      })
      if (typeof res.creditsLeft === "number") dispatch(updateCredits(res.creditsLeft))
      toast(
        mode === "harder" ? "Harder test ready" : "New questions ready — good luck!",
        "success"
      )
      navigate(`/mock-test/${res.testId}`)
    } catch (e) {
      toast(e?.response?.data?.message || "Could not generate a new test", "error")
      if (e?.response?.status === 403) navigate("/pricing")
    } finally {
      setRegenLoading(null)
    }
  }

  const dist = [
    { name: "Correct", value: score.correct || 0, color: "#34d399" },
    { name: "Wrong", value: score.wrong || 0, color: "#f87171" },
    { name: "Skipped", value: score.skipped || 0, color: "#94a3b8" },
  ]

  const downloadReport = () => {
    const lines = [
      `Mindovio Mock Test Report`,
      `Topic: ${data.topic}`,
      `Difficulty: ${data.difficulty}`,
      `Score: ${score.correct}/${score.total} (${score.percentage}%) — Grade ${score.grade}`,
      `Accuracy: ${score.accuracy}%`,
      `Time: ${formatDuration(data.timeTakenSec)}`,
      `XP: ${score.xpEarned}`,
      `Badges: ${badges.join(", ") || "—"}`,
      "",
      "AI Feedback:",
      feedback.summary || "",
      "",
      "Weak topics:",
      ...(feedback.weakTopics || []).map(
        (w) => `- ${w.topic} (confidence ${w.confidence}%): ${w.recommendation}`
      ),
      "",
      "Study plan:",
      ...(feedback.studyPlan || []).map((s) => `- ${s.when}: ${s.task}`),
      "",
      "Answer key:",
      ...perQuestion.map(
        (q, i) =>
          `${i + 1}. [${q.status}] ${q.prompt}\n   Correct: ${typeof q.correctAnswer === "object" ? JSON.stringify(q.correctAnswer) : q.correctAnswer}\n   Your answer: ${typeof q.given === "object" ? JSON.stringify(q.given) : q.given ?? "—"}\n   Why: ${q.explanation?.whyCorrect || ""}`
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Mindovio-MockTest-${(data.topic || "report").replace(/\s+/g, "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 print:space-y-4" id="mock-test-report">
      {/* Score hero */}
      <Card className="premium-card !p-6 sm:!p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFF]/15 via-transparent to-[#4F8BFF]/10 pointer-events-none" />
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="type-caption mb-1">Final score</p>
            <p className="text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              {score.correct}/{score.total}
            </p>
            <p className="type-sm mt-1 text-[var(--color-text-secondary)]">
              {score.percentage}% · Grade {score.grade}
            </p>
          </div>
          <Stat label="Accuracy" value={`${score.accuracy ?? 0}%`} icon={Target} />
          <Stat label="Time taken" value={formatDuration(data.timeTakenSec)} icon={TrendingUp} />
          <Stat label="XP earned" value={`+${score.xpEarned || 0}`} icon={Zap} />
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <Pill tone="success">Correct {score.correct}</Pill>
          <Pill tone="danger">Wrong {score.wrong}</Pill>
          <Pill>Skipped {score.skipped}</Pill>
          {badges.map((b) => (
            <Pill key={b} tone="brand" icon={Award}>
              {b}
            </Pill>
          ))}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 min-w-0">
        <Card className="!p-4 sm:!p-5 min-w-0">
          <h3 className="type-h4 mb-4">Score distribution</h3>
          <div className="h-48 sm:h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist}>
                <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {dist.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="!p-4 sm:!p-5 min-w-0">
          <h3 className="type-h4 mb-4">Topic confidence</h3>
          <div className="h-48 sm:h-56 w-full min-w-0">
            {radar.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis
                    dataKey="topic"
                    tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    dataKey="score"
                    stroke="#7C5CFF"
                    fill="#7C5CFF"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="type-sm text-[var(--color-text-muted)] pt-16 text-center">
                Not enough topic data for radar chart
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* AI feedback */}
      <Card className="!p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="type-h3 flex items-center gap-2">
            <Sparkles className="text-brand-500" size={20} /> AI feedback
          </h3>
          {feedbackStatus === "pending" && (
            <span className="type-caption rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:text-brand-300 animate-pulse">
              Refining personalized insights…
            </span>
          )}
          {feedbackStatus === "ready" && (
            <span className="type-caption rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-400">
              Personalized
            </span>
          )}
        </div>
        <p className="type-body text-[var(--color-text-secondary)]">
          {feedback.summary || "Your score is ready. Insights will appear shortly."}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <ListBlock title="Strengths" items={feedback.strengths} tone="success" />
          <ListBlock title="Weaknesses" items={feedback.weaknesses} tone="danger" />
        </div>
      </Card>

      {/* Weak topics */}
      {(feedback.weakTopics || []).length > 0 && (
        <Card className="!p-6">
          <h3 className="type-h3 mb-4">Weak topics</h3>
          <div className="space-y-3">
            {feedback.weakTopics.map((w) => (
              <div
                key={w.topic}
                className="rounded-2xl border border-[var(--color-border)] p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-text-primary)]">{w.topic}</p>
                  <p className="type-sm text-[var(--color-text-secondary)] mt-1">
                    {w.recommendation}
                  </p>
                </div>
                <div className="text-center shrink-0">
                  <p className="type-caption">Confidence</p>
                  <p className="text-xl font-bold text-brand-500">{w.confidence}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations + study plan */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="!p-6 space-y-3">
          <h3 className="type-h4 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-500" /> Smart recommendations
          </h3>
          <ListBlock title="Revise sections" items={feedback.recommendations?.sectionsToRevise} />
          <ListBlock title="Definitions" items={feedback.recommendations?.definitions} />
          <ListBlock title="Formulas" items={feedback.recommendations?.formulas} />
          <ListBlock title="Frequent mistakes" items={feedback.recommendations?.frequentMistakes} />
        </Card>
        <Card className="!p-6">
          <h3 className="type-h4 mb-4">Personalized study plan</h3>
          <ol className="space-y-3">
            {(feedback.studyPlan || []).map((s, i) => (
              <li
                key={i}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-4 py-3"
              >
                <p className="type-caption text-brand-500 font-semibold">{s.when}</p>
                <p className="type-sm text-[var(--color-text-primary)] mt-0.5">{s.task}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Explanations */}
      <Card className="!p-6">
        <h3 className="type-h3 mb-4">Answer explanations</h3>
        <div className="space-y-4">
          {perQuestion.map((q, i) => (
            <details
              key={q.id}
              className="rounded-2xl border border-[var(--color-border)] overflow-hidden group"
              open={i < 3}
            >
              <summary className="cursor-pointer list-none px-4 py-3 flex items-start gap-3 hover:bg-[var(--color-surface-muted)]/50">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    q.status === "correct"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : q.status === "wrong"
                        ? "bg-rose-500/15 text-rose-500"
                        : "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {q.status}
                </span>
                <span className="type-sm font-medium text-[var(--color-text-primary)]">
                  {i + 1}. {q.prompt}
                </span>
              </summary>
              <div className="px-4 pb-4 space-y-2 type-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
                <p>
                  <strong className="text-[var(--color-text-primary)]">Correct:</strong>{" "}
                  {typeof q.correctAnswer === "object"
                    ? JSON.stringify(q.correctAnswer)
                    : String(q.correctAnswer)}
                </p>
                <p>{q.explanation?.whyCorrect}</p>
                {(q.explanation?.whyWrong || []).length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {q.explanation.whyWrong.map((w, j) => (
                      <li key={j}>{w}</li>
                    ))}
                  </ul>
                )}
                {q.explanation?.memoryTrick && (
                  <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-brand-600 dark:text-brand-300">
                    Memory trick: {q.explanation.memoryTrick}
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <Button
          onClick={() => regenerate("same")}
          loading={regenLoading === "same"}
          disabled={!!regenLoading}
          icon={<RefreshCw size={16} />}
        >
          Retry same settings
        </Button>
        <Button
          variant="secondary"
          onClick={() => regenerate("new")}
          loading={regenLoading === "new"}
          disabled={!!regenLoading}
          icon={<Sparkles size={16} />}
        >
          New questions
        </Button>
        <Button
          variant="secondary"
          onClick={() => regenerate("harder")}
          loading={regenLoading === "harder"}
          disabled={!!regenLoading}
          icon={<TrendingUp size={16} />}
        >
          Increase difficulty
        </Button>
        <Button variant="secondary" onClick={() => navigate("/mock-tests")} icon={<Award size={16} />}>
          Test history
        </Button>
        <Button variant="secondary" onClick={downloadReport} icon={<Download size={16} />}>
          Download report
        </Button>
        <Button variant="secondary" onClick={() => window.print()} icon={<Download size={16} />}>
          Print / PDF
        </Button>
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          Back to notes
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="type-caption mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} />} {label}
      </p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
    </div>
  )
}

function Pill({ children, tone = "neutral", icon: Icon }) {
  const tones = {
    neutral: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
    success: "bg-emerald-500/15 text-emerald-500",
    danger: "bg-rose-500/15 text-rose-500",
    brand: "bg-brand-500/15 text-brand-600 dark:text-brand-300",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  )
}

function ListBlock({ title, items, tone }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="type-caption mb-1.5 font-semibold">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className={`type-sm flex gap-2 ${
              tone === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : tone === "danger"
                  ? "text-rose-500"
                  : "text-[var(--color-text-secondary)]"
            }`}
          >
            <span>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
