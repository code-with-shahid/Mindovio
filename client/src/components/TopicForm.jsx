import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useDispatch } from "react-redux"
import { HiSparkles } from "react-icons/hi2"
import { generateNotes } from "../services/api"
import { updateCredits } from "../redux/userSlice"
import { useToast } from "../context/ToastContext"
import Button from "./ui/Button"
import Card from "./ui/Card"

function getGenerateError(error) {
  const status = error?.response?.status
  const message = error?.response?.data?.message || error?.response?.data?.error || ""

  if (status === 402 || /credit/i.test(message)) {
    return {
      text: message || "You don’t have enough credits. Buy more to keep generating notes.",
      lowCredits: true,
    }
  }
  if (status === 401) {
    return { text: "Your session expired. Please sign in again.", lowCredits: false }
  }
  if (status === 429) {
    return { text: "Too many requests. Please wait a moment and try again.", lowCredits: false }
  }
  if (!error?.response) {
    return { text: "Network error. Check your connection and try again.", lowCredits: false }
  }
  return {
    text: typeof message === "string" && message ? message : "Failed to generate notes. Please try again.",
    lowCredits: false,
  }
}

export default function TopicForm({ setResult, setLoading, loading, setError, setLowCredits, setNoteId }) {
  const [topic, setTopic] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [examType, setExamType] = useState("")
  const [revisionMode, setRevisionMode] = useState(false)
  const [includeDiagram, setIncludeDiagram] = useState(false)
  const [includeChart, setIncludeChart] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")
  const dispatch = useDispatch()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic")
      setLowCredits?.(false)
      return
    }
    setError("")
    setLowCredits?.(false)
    setLoading(true)
    setResult(null)
    setNoteId?.(null)
    try {
      const result = await generateNotes({
        topic, classLevel, examType, revisionMode, includeDiagram, includeChart,
      })
      if (result?.data) {
        setResult(result.data)
        setNoteId?.(result.noteId || null)
        if (typeof result.creditsLeft === "number") {
          dispatch(updateCredits(result.creditsLeft))
        }
        toast("Notes generated successfully", "success")
      }
      // Keep topic context for follow-up generations; only clear optional fields lightly
      setIncludeChart(false)
      setRevisionMode(false)
      setIncludeDiagram(false)
    } catch (error) {
      console.error(error)
      const { text, lowCredits } = getGenerateError(error)
      setError(text)
      setLowCredits?.(lowCredits)
      toast(text, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      setProgress(0)
      setProgressText("")
      return
    }
    let value = 0
    const interval = setInterval(() => {
      value += Math.random() * 8
      if (value >= 95) {
        value = 95
        setProgressText("Almost done…")
        clearInterval(interval)
      } else if (value > 70) {
        setProgressText("Finalizing notes…")
      } else if (value > 40) {
        setProgressText("Processing content…")
      } else {
        setProgressText("Generating notes…")
      }
      setProgress(Math.floor(value))
    }, 700)
    return () => clearInterval(interval)
  }, [loading])

  const inputClass = "ui-input"

  return (
    <Card glass className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <HiSparkles className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="type-h4">New Generation</h2>
          <p className="type-caption mt-0.5">Costs 10 credits per generation</p>
        </div>
      </div>

      <input
        type="text"
        className={inputClass}
        placeholder="Enter topic (e.g. Operating Systems, Organic Chemistry)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
        disabled={loading}
        aria-label="Topic"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          className={inputClass}
          placeholder="Class / Level (e.g. Class 12, B.Tech)"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          disabled={loading}
          aria-label="Class level"
        />
        <input
          type="text"
          className={inputClass}
          placeholder="Exam Type (e.g. CBSE, JEE, GATE)"
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          disabled={loading}
          aria-label="Exam type"
        />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        <Toggle label="Revision Mode" checked={revisionMode} onChange={() => setRevisionMode(!revisionMode)} disabled={loading} />
        <Toggle label="Include Diagram" checked={includeDiagram} onChange={() => setIncludeDiagram(!includeDiagram)} disabled={loading} />
        <Toggle label="Include Charts" checked={includeChart} onChange={() => setIncludeChart(!includeChart)} disabled={loading} />
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={loading}
        loading={loading}
        onClick={handleSubmit}
        icon={!loading ? <HiSparkles /> : null}
      >
        {loading ? "Generating Notes…" : "Generate Notes"}
      </Button>

      {loading && (
        <div className="space-y-2">
          <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>{progressText}</span>
            <span>{progress}%</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            This may take 1–3 minutes. Please keep this page open.
          </p>
        </div>
      )}
    </Card>
  )
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="flex items-center gap-3 select-none group disabled:opacity-50"
    >
      <div
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${checked ? "bg-brand-600" : "bg-[var(--color-border)]"}
        `}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
          style={{ left: checked ? "1.375rem" : "0.125rem" }}
        />
      </div>
      <span className={`text-sm font-medium transition-colors ${
        checked ? "text-brand-600 dark:text-brand-400" : "text-secondary"
      }`}>
        {label}
      </span>
    </button>
  )
}
