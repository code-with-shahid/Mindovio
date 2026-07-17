import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Flag,
  Hourglass,
  ListChecks,
  Play,
  Send,
  SkipForward,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Alert from "../components/ui/Alert"
import { getMockTest, startMockTest, submitMockTest } from "../services/api"
import { useToast } from "../context/ToastContext"
import MockTestResults from "../components/mocktest/MockTestResults"

const SECONDS_PER_QUESTION = 60
const SOUND_KEY = "mindovio-timer-sound"
const sessionKey = (testId) => `mindovio-exam-${testId}`

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
}

function hasAnswer(value) {
  if (value == null || value === "") return false
  if (typeof value === "object") return Object.keys(value).length > 0
  return true
}

/* ─── Web Audio: soft tick + beep (created lazily on user gesture) ─── */
function createSoundEngine() {
  let ctx = null
  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {})
    return ctx
  }
  const blip = (freq, duration, gainValue) => {
    const ac = ensure()
    if (!ac) return
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    gain.gain.setValueAtTime(gainValue, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start()
    osc.stop(ac.currentTime + duration)
  }
  return {
    tick: () => blip(880, 0.07, 0.05),
    beep: () => blip(520, 0.45, 0.09),
    unlock: () => ensure(),
  }
}

/* ─── Question input renderer ─── */
function QuestionBody({ question, value, onChange, locked }) {
  const type = question?.type || "mcq"

  const body = (() => {
    if (
      type === "mcq" ||
      type === "true_false" ||
      type === "scenario" ||
      type === "assertion_reason" ||
      type === "diagram"
    ) {
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
  })()

  if (locked) {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-55 select-none">{body}</div>
        <p className="mt-3 type-sm rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 font-medium text-rose-500">
          Time over for this question — the answer is locked.
        </p>
      </div>
    )
  }
  return body
}

/* ─── Intro / ready screen ─── */
function IntroScreen({ meta, questions, soundOn, onToggleSound, onStart, starting }) {
  const totalSec = questions.length * SECONDS_PER_QUESTION
  const rules = [
    `${questions.length} questions · exactly 1 minute per question`,
    `Total time: ${formatTime(totalSec)} — the exam auto-submits when it ends`,
    "Each question auto-advances when its minute is up (unanswered = skipped)",
    "You can move freely with Previous / Next and the question palette",
    "Warnings appear at 20s and 10s, with a final 5-second countdown",
  ]
  return (
    <Card className="premium-card !p-6 sm:!p-10 max-w-2xl mx-auto text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8BFF] text-white shadow-lg shadow-[#7C5CFF]/30">
        <Timer size={30} />
      </div>
      <h2 className="type-h2 mb-1">{meta?.topic || "Mock Test"}</h2>
      <p className="type-sm text-[var(--color-text-secondary)] capitalize mb-6">
        {meta?.difficulty || "mixed"} difficulty · {questions.length} questions ·{" "}
        {formatTime(totalSec)} total
      </p>

      <ul className="mx-auto max-w-md space-y-2.5 text-left mb-7">
        {rules.map((r) => (
          <li key={r} className="flex items-start gap-2.5 type-sm text-[var(--color-text-secondary)]">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-500" />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onToggleSound}
        className={`mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          soundOn
            ? "border-brand-500 bg-brand-500/12 text-brand-600 dark:text-brand-300"
            : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
        }`}
      >
        {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        Timer sound {soundOn ? "on" : "off"}
      </button>

      <div>
        <Button size="lg" onClick={onStart} loading={starting} icon={<Play size={18} />}>
          Start Test
        </Button>
      </div>
      <p className="type-caption mt-4 text-[var(--color-text-muted)]">
        The timer begins after a short Ready 3·2·1 countdown — never before.
      </p>
    </Card>
  )
}

/* ─── Ready / 3 / 2 / 1 / Go overlay ─── */
function CountdownOverlay({ step }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p
            className={`font-extrabold tracking-tight text-white ${
              step === "Ready?" ? "text-5xl sm:text-6xl" : "text-7xl sm:text-8xl"
            } ${step === "Go!" ? "text-emerald-400" : ""}`}
          >
            {step}
          </p>
          {step === "Ready?" && (
            <p className="mt-3 text-sm text-slate-300">Your exam is about to begin</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─── Submitting overlay ─── */
function SubmittingOverlay() {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setStage(1), 1400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="text-center px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-brand-500/30 border-t-brand-500"
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-lg font-semibold text-white"
          >
            {stage === 0 ? "Submitting Answers…" : "Generating AI Feedback…"}
          </motion.p>
        </AnimatePresence>
        <p className="mt-2 text-sm text-slate-300">Please don’t close this tab</p>
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function MockTestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [phase, setPhase] = useState("loading") // loading | intro | countdown | exam | submitting | result | error
  const [error, setError] = useState("")
  const [meta, setMeta] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState([])
  const [visited, setVisited] = useState([])
  const [skipped, setSkipped] = useState([])
  const [index, setIndex] = useState(0)
  const [totalRemaining, setTotalRemaining] = useState(0)
  const [qTimeLeft, setQTimeLeft] = useState(SECONDS_PER_QUESTION)
  const [countdownStep, setCountdownStep] = useState("Ready?")
  const [starting, setStarting] = useState(false)
  const [soundOn, setSoundOn] = useState(
    () => localStorage.getItem(SOUND_KEY) === "1"
  )
  const [resultPayload, setResultPayload] = useState(null)

  const startedAtRef = useRef(null) // epoch ms when "Go!" finished
  const budgetRef = useRef({}) // qid -> seconds remaining for that question
  const lastTickRef = useRef(null)
  const submittedRef = useRef(false)
  const soundRef = useRef(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const totalSec = questions.length * SECONDS_PER_QUESTION
  const current = questions[index]

  if (!soundRef.current) soundRef.current = createSoundEngine()

  const answeredCount = useMemo(
    () => questions.filter((q) => hasAnswer(answers[q.id])).length,
    [answers, questions]
  )
  const skippedCount = useMemo(
    () => skipped.filter((id) => !hasAnswer(answers[id])).length,
    [skipped, answers]
  )

  /* ── Load test / restore session ── */
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await getMockTest(testId)
        if (!alive) return
        if (data.status === "submitted") {
          setResultPayload(data)
          setMeta(data)
          setPhase("result")
          return
        }
        const qs = data.questions || []
        setMeta(data)
        setQuestions(qs)

        // Restore an in-progress session after refresh
        let saved = null
        try {
          saved = JSON.parse(localStorage.getItem(sessionKey(testId)) || "null")
        } catch {
          saved = null
        }
        if (saved?.startedAtMs && qs.length) {
          const total = qs.length * SECONDS_PER_QUESTION
          const elapsed = Math.floor((Date.now() - saved.startedAtMs) / 1000)
          const left = total - elapsed
          setAnswers(saved.answers || {})
          setFlagged(saved.flagged || [])
          setVisited(saved.visited || [])
          setSkipped(saved.skipped || [])
          setIndex(Math.min(saved.index || 0, qs.length - 1))
          budgetRef.current = saved.budgets || {}
          startedAtRef.current = saved.startedAtMs

          if (left <= 0) {
            // Time expired while away — submit what was saved
            setTotalRemaining(0)
            setPhase("submitting")
            doSubmit(true, saved.answers || {}, saved.flagged || [], total)
            return
          }
          setTotalRemaining(left)
          const curId = qs[Math.min(saved.index || 0, qs.length - 1)]?.id
          setQTimeLeft(budgetRef.current[curId] ?? SECONDS_PER_QUESTION)
          setPhase("exam")
          toast("Test resumed — timer continued from where you left", "info")
          return
        }

        setTotalRemaining(qs.length * SECONDS_PER_QUESTION)
        setPhase("intro")
      } catch (e) {
        if (!alive) return
        setError(e?.response?.data?.message || "Could not load mock test")
        setPhase("error")
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId])

  /* ── Persist session every state change (cheap JSON) ── */
  useEffect(() => {
    if (phase !== "exam" || !startedAtRef.current) return
    const payload = {
      startedAtMs: startedAtRef.current,
      answers,
      flagged,
      visited,
      skipped,
      index,
      budgets: budgetRef.current,
    }
    try {
      localStorage.setItem(sessionKey(testId), JSON.stringify(payload))
    } catch {
      /* storage full — non-fatal */
    }
  }, [phase, answers, flagged, visited, skipped, index, qTimeLeft, testId])

  /* ── Mark current question visited ── */
  useEffect(() => {
    if (phase !== "exam" || !current) return
    setVisited((v) => (v.includes(current.id) ? v : [...v, current.id]))
  }, [phase, current])

  /* ── Submit ── */
  const doSubmit = useCallback(
    async (auto = false, answersOverride = null, flaggedOverride = null, timeOverride = null) => {
      if (submittedRef.current) return
      submittedRef.current = true
      setPhase("submitting")

      const finalAnswers = answersOverride ?? answers
      const finalFlagged = flaggedOverride ?? flagged
      const total = questions.length * SECONDS_PER_QUESTION
      const elapsed =
        timeOverride ??
        (startedAtRef.current
          ? Math.min(total, Math.floor((Date.now() - startedAtRef.current) / 1000))
          : 0)

      const questionTimes = {}
      for (const q of questions) {
        const left = budgetRef.current[q.id]
        questionTimes[q.id] =
          typeof left === "number"
            ? Math.max(0, Math.min(SECONDS_PER_QUESTION, SECONDS_PER_QUESTION - left))
            : 0
      }

      try {
        const data = await submitMockTest(testId, {
          answers: finalAnswers,
          flagged: finalFlagged,
          timeTakenSec: elapsed,
          questionTimes,
        })
        localStorage.removeItem(sessionKey(testId))
        setResultPayload(data)
        setPhase("result")
        toast(auto ? "Time’s up — test submitted" : "Test submitted!", auto ? "info" : "success")
      } catch (e) {
        submittedRef.current = false
        setPhase("exam")
        toast(e?.response?.data?.message || "Submit failed — try again", "error")
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, flagged, questions, testId]
  )

  /* ── Question timeout: save/skip + advance or submit ── */
  const handleQuestionTimeout = useCallback(() => {
    const q = questions[index]
    if (!q) return
    if (soundOn) soundRef.current.beep()
    if (!hasAnswer(answers[q.id])) {
      setSkipped((s) => (s.includes(q.id) ? s : [...s, q.id]))
    }
    // Last question's minute over → auto submit
    if (index >= questions.length - 1) {
      doSubmit(true)
      return
    }
    // Find next question that still has time budget
    const nextIdx = (() => {
      for (let i = index + 1; i < questions.length; i++) {
        if ((budgetRef.current[questions[i].id] ?? SECONDS_PER_QUESTION) > 0) return i
      }
      for (let i = 0; i < index; i++) {
        if ((budgetRef.current[questions[i].id] ?? SECONDS_PER_QUESTION) > 0) return i
      }
      return -1
    })()
    if (nextIdx === -1) {
      doSubmit(true)
      return
    }
    setIndex(nextIdx)
    setQTimeLeft(budgetRef.current[questions[nextIdx].id] ?? SECONDS_PER_QUESTION)
  }, [questions, index, answers, soundOn, doSubmit])

  /* ── Timer engine: single interval, timestamp-based (no drift) ── */
  useEffect(() => {
    if (phase !== "exam" || !questions.length || !startedAtRef.current) return

    lastTickRef.current = Date.now()
    const timer = setInterval(() => {
      if (phaseRef.current !== "exam") return
      const now = Date.now()
      const delta = Math.max(1, Math.round((now - lastTickRef.current) / 1000))
      lastTickRef.current = now

      // Total time: absolute from start timestamp (survives re-renders / throttling)
      const totalLeft = totalSec - Math.floor((now - startedAtRef.current) / 1000)
      setTotalRemaining(Math.max(0, totalLeft))
      if (totalLeft <= 0) {
        doSubmit(true)
        return
      }

      // Current question budget
      const q = questions[index]
      if (!q) return
      const prev = budgetRef.current[q.id] ?? SECONDS_PER_QUESTION
      if (prev <= 0) return
      const left = Math.max(0, prev - delta)
      budgetRef.current[q.id] = left
      setQTimeLeft(left)

      if (soundOn && left > 0 && left <= 5) soundRef.current.tick()
      if (left <= 0) handleQuestionTimeout()
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, index, questions, totalSec, soundOn, doSubmit, handleQuestionTimeout])

  /* ── Start flow: API start → Ready 3 2 1 Go → exam ── */
  const beginCountdown = async () => {
    setStarting(true)
    try {
      await startMockTest(testId)
    } catch {
      /* non-fatal: exam timing is client-driven */
    }
    soundRef.current.unlock()
    setStarting(false)
    setPhase("countdown")

    const steps = ["Ready?", "3", "2", "1", "Go!"]
    steps.forEach((s, i) => {
      setTimeout(() => {
        setCountdownStep(s)
        if (soundOn && (s === "3" || s === "2" || s === "1")) soundRef.current.tick()
        if (s === "Go!") {
          setTimeout(() => {
            // Timer starts here — exactly at Go!, never before
            budgetRef.current = {}
            questions.forEach((q) => {
              budgetRef.current[q.id] = SECONDS_PER_QUESTION
            })
            startedAtRef.current = Date.now()
            setTotalRemaining(questions.length * SECONDS_PER_QUESTION)
            setQTimeLeft(SECONDS_PER_QUESTION)
            setIndex(0)
            setPhase("exam")
          }, 550)
        }
      }, i * 900)
    })
  }

  const toggleSound = () => {
    setSoundOn((s) => {
      const next = !s
      localStorage.setItem(SOUND_KEY, next ? "1" : "0")
      return next
    })
  }

  const goTo = (i) => {
    if (i < 0 || i >= questions.length) return
    setIndex(i)
    setQTimeLeft(budgetRef.current[questions[i].id] ?? SECONDS_PER_QUESTION)
  }

  const skipCurrent = () => {
    if (!current) return
    if (!hasAnswer(answers[current.id])) {
      setSkipped((s) => (s.includes(current.id) ? s : [...s, current.id]))
    }
    goTo(Math.min(questions.length - 1, index + 1))
  }

  const setAnswer = (val) => {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: val }))
    setSkipped((s) => s.filter((id) => id !== current.id))
  }

  const toggleFlag = () => {
    if (!current) return
    setFlagged((f) =>
      f.includes(current.id) ? f.filter((id) => id !== current.id) : [...f, current.id]
    )
  }

  const statusFor = (q) => {
    if (hasAnswer(answers[q.id])) return "answered"
    if (skipped.includes(q.id)) return "skipped"
    if (visited.includes(q.id)) return "visited"
    return "unvisited"
  }

  /* ── Renders ── */
  if (phase === "loading") {
    return (
      <DashboardLayout>
        <DashboardTopbar title="Mock Test" subtitle="Loading your personalized test…" />
        <Card className="p-10 text-center type-sm text-[var(--color-text-muted)] animate-pulse">
          Preparing questions…
        </Card>
      </DashboardLayout>
    )
  }

  if (phase === "error") {
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

  if (phase === "result" && resultPayload) {
    return (
      <DashboardLayout>
        <DashboardTopbar
          title="Mock Test Results"
          subtitle={resultPayload.topic || meta?.topic}
        />
        <MockTestResults data={resultPayload} noteId={resultPayload.noteId || meta?.noteId} />
      </DashboardLayout>
    )
  }

  if (phase === "intro") {
    return (
      <DashboardLayout>
        <DashboardTopbar
          title={meta?.topic || "Mock Test"}
          subtitle={`${meta?.difficulty || "mixed"} · ${questions.length} questions · ${formatTime(totalSec)}`}
        />
        <IntroScreen
          meta={meta}
          questions={questions}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onStart={beginCountdown}
          starting={starting}
        />
      </DashboardLayout>
    )
  }

  const qGlow =
    qTimeLeft <= 5
      ? "timer-glow-red"
      : qTimeLeft <= 10
        ? "timer-glow-orange"
        : qTimeLeft <= 20
          ? "timer-glow-yellow"
          : ""

  const currentLocked =
    current && (budgetRef.current[current.id] ?? SECONDS_PER_QUESTION) <= 0

  const answeredPct = questions.length ? (answeredCount / questions.length) * 100 : 0
  const skippedPct = questions.length ? (skippedCount / questions.length) * 100 : 0

  return (
    <DashboardLayout>
      {phase === "countdown" && <CountdownOverlay step={countdownStep} />}
      {phase === "submitting" && <SubmittingOverlay />}

      <DashboardTopbar
        title={meta?.topic || "Mock Test"}
        subtitle={`${meta?.difficulty || "mixed"} · ${questions.length} questions`}
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] gap-4 sm:gap-5 min-w-0">
        <div className="space-y-4 min-w-0 order-1">
          {/* ── Top bar: question no. + timers + progress ── */}
          <Card className="!p-3 sm:!p-4 lg:sticky lg:top-20 z-30 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
              <p className="type-sm font-semibold">
                Question {index + 1} / {questions.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
                  title={soundOn ? "Disable timer sound" : "Enable timer sound"}
                >
                  {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <div
                  className={`timer-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums bg-brand-500/10 text-brand-600 dark:text-brand-300 ${qGlow}`}
                  title="Time left for this question"
                >
                  <Hourglass size={13} />
                  {formatTime(qTimeLeft)}
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
                    totalRemaining <= 60
                      ? "bg-rose-500/15 text-rose-500"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  }`}
                  title="Total time remaining"
                >
                  <Clock size={13} />
                  {formatTime(totalRemaining)}
                </div>
              </div>
            </div>
            {/* Segmented progress: answered (green) + skipped (orange) */}
            <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden flex">
              <motion.div
                className="h-full bg-emerald-500"
                initial={false}
                animate={{ width: `${answeredPct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
              <motion.div
                className="h-full bg-orange-400"
                initial={false}
                animate={{ width: `${skippedPct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 type-caption text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Answered {answeredCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-400" /> Skipped {skippedCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-border)]" /> Remaining{" "}
                {Math.max(0, questions.length - answeredCount - skippedCount)}
              </span>
            </div>
          </Card>

          {/* ── Warnings ── */}
          <AnimatePresence>
            {phase === "exam" && !currentLocked && qTimeLeft <= 20 && qTimeLeft > 10 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 type-sm font-medium text-amber-600 dark:text-amber-400"
              >
                🟡 20 seconds remaining. Review your answer.
              </motion.div>
            )}
            {phase === "exam" && !currentLocked && qTimeLeft <= 10 && qTimeLeft > 5 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-orange-500/35 bg-orange-500/12 px-4 py-2.5 type-sm font-semibold text-orange-600 dark:text-orange-400"
              >
                🟠 Only 10 seconds left! Answer quickly.
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Question card ── */}
          {current ? (
            <Card className="premium-card !p-4 sm:!p-6 space-y-4 relative">
              {/* Final 5s animated countdown */}
              <AnimatePresence>
                {phase === "exam" && !currentLocked && qTimeLeft <= 5 && qTimeLeft > 0 && (
                  <motion.div
                    key={qTimeLeft}
                    initial={{ opacity: 0, scale: 1.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.4 }}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-2xl font-extrabold text-rose-500 timer-glow-red"
                  >
                    {qTimeLeft}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center gap-2 pr-14">
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
                locked={currentLocked}
              />
            </Card>
          ) : (
            <Card className="!p-6">
              <p className="type-sm text-[var(--color-text-muted)]">
                No questions loaded for this test. Go back and generate a new mock test.
              </p>
            </Card>
          )}

          {/* ── Navigation ── */}
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={index === 0}
                onClick={() => goTo(index - 1)}
                icon={<ArrowLeft size={16} />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={index >= questions.length - 1}
                onClick={skipCurrent}
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
                <Button onClick={() => goTo(index + 1)} icon={<ArrowRight size={16} />}>
                  Next
                </Button>
              ) : (
                <Button onClick={() => doSubmit(false)} icon={<Send size={16} />}>
                  Submit test
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Question palette ── */}
        <Card className="!p-4 h-fit lg:sticky lg:top-24 order-2 min-w-0">
          <p className="type-label mb-3 flex items-center gap-2">
            <ListChecks size={14} /> Question palette
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 mb-4">
            {questions.map((q, i) => {
              const st = statusFor(q)
              const colors = {
                answered: "bg-emerald-500 text-white",
                skipped: "bg-orange-400 text-white",
                visited: "bg-blue-500 text-white",
                unvisited:
                  "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
              }
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`relative h-9 rounded-lg text-xs font-semibold transition-transform hover:scale-105 ${colors[st]} ${
                    i === index
                      ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-[var(--color-surface-elevated)]"
                      : ""
                  }`}
                >
                  {i + 1}
                  {flagged.includes(q.id) && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border border-[var(--color-surface-elevated)]" />
                  )}
                </button>
              )
            })}
          </div>
          <ul className="space-y-1.5 type-caption text-[var(--color-text-muted)]">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-border)]" /> Not visited
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Visited
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Answered
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400" /> Skipped
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full ring-2 ring-purple-500" /> Current
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Flagged for review
            </li>
          </ul>
          <Button
            className="w-full mt-4"
            onClick={() => doSubmit(false)}
            icon={<CheckCircle2 size={16} />}
          >
            Submit test
          </Button>
          <p className="type-caption mt-2 text-center text-[var(--color-text-muted)] flex items-center justify-center gap-1">
            <Bookmark size={11} /> Auto-submits when total time ends
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
