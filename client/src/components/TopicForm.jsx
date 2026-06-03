import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useDispatch } from "react-redux"
import { HiSparkles } from "react-icons/hi2"
import { generateNotes } from "../services/api"
import { updateCredits } from "../redux/userSlice"
import Button from "./ui/Button"
import Card from "./ui/Card"

export default function TopicForm({ setResult, setLoading, loading, setError }) {
  const [topic, setTopic] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [examType, setExamType] = useState("")
  const [revisionMode, setRevisionMode] = useState(false)
  const [includeDiagram, setIncludeDiagram] = useState(false)
  const [includeChart, setIncludeChart] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")
  const dispatch = useDispatch()

  const handleSubmit = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
    try {
      const result = await generateNotes({
        topic, classLevel, examType, revisionMode, includeDiagram, includeChart,
      })
      if (result?.data) {
        setResult(result.data)
        if (typeof result.creditsLeft === "number") {
          dispatch(updateCredits(result.creditsLeft))
        }
      }
      setTopic("")
      setClassLevel("")
      setExamType("")
      setIncludeChart(false)
      setRevisionMode(false)
      setIncludeDiagram(false)
    } catch (error) {
      console.error(error)
      setError("Failed to generate notes. Please try again.")
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

  const inputClass = `
    w-full px-4 py-3 text-sm rounded-xl
    border border-[var(--color-border)] bg-[var(--color-surface-muted)]
    text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
    focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50
    transition-all duration-200
  `

  return (
    <Card glass className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <HiSparkles className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="font-semibold text-[var(--color-text-primary)]">New Generation</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Costs 10 credits per generation</p>
        </div>
      </div>

      <input
        type="text"
        className={inputClass}
        placeholder="Enter topic (e.g. Operating Systems, Organic Chemistry)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          className={inputClass}
          placeholder="Class / Level (e.g. Class 12, B.Tech)"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
        />
        <input
          type="text"
          className={inputClass}
          placeholder="Exam Type (e.g. CBSE, JEE, GATE)"
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        <Toggle label="Revision Mode" checked={revisionMode} onChange={() => setRevisionMode(!revisionMode)} />
        <Toggle label="Include Diagram" checked={includeDiagram} onChange={() => setIncludeDiagram(!includeDiagram)} />
        <Toggle label="Include Charts" checked={includeChart} onChange={() => setIncludeChart(!includeChart)} />
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
              className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
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

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 select-none group"
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
        checked ? "text-brand-600 dark:text-brand-400" : "text-[var(--color-text-secondary)]"
      }`}>
        {label}
      </span>
    </button>
  )
}
