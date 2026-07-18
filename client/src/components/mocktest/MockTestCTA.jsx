import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { motion } from "motion/react"
import { ClipboardList, Sparkles, X } from "lucide-react"
import { generateMockTest } from "../../services/api"
import { updateCredits } from "../../redux/userSlice"
import { useToast } from "../../context/ToastContext"
import Button from "../ui/Button"

const DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "mixed", label: "Mixed" },
]

const COUNTS = [10, 20, 30, 50]

export function MockTestCTA({ noteId, topic }) {
  const [open, setOpen] = useState(false)

  if (!noteId) return null

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-500/25 bg-gradient-to-br from-[#7C5CFF]/15 via-[var(--color-surface-elevated)] to-[#4F8BFF]/10 p-4 sm:p-6 lg:p-8 print:hidden"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#A855F7]/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8BFF] text-white shadow-lg shadow-[#7C5CFF]/30">
            <ClipboardList size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="type-overline text-brand-500 mb-1">Optional</p>
            <h3 className="type-h3 text-[var(--color-text-primary)] mb-1">
              Test Your Knowledge
            </h3>
            <p className="type-sm text-[var(--color-text-secondary)] max-w-xl">
              Ready to check your understanding? Take a personalized AI-generated mock test
              based on these notes{topic ? ` for “${topic}”` : ""}.
            </p>
          </div>
          <Button size="lg" className="w-full sm:w-auto shrink-0" onClick={() => setOpen(true)} icon={<Sparkles size={16} />}>
            Start Mock Test
          </Button>
        </div>
        <p className="relative mt-4 type-caption text-[var(--color-text-muted)]">
          Free & optional · Usually ready in under a minute
        </p>
      </motion.section>

      {open && (
        <MockTestSetupModal
          noteId={noteId}
          topic={topic}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function MockTestSetupModal({ noteId, topic, onClose }) {
  const [difficulty, setDifficulty] = useState("mixed")
  const [questionCount, setQuestionCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { toast } = useToast()

  const handleStart = async () => {
    setLoading(true)
    try {
      const data = await generateMockTest({ noteId, difficulty, questionCount })
      if (typeof data.creditsLeft === "number") {
        dispatch(updateCredits(data.creditsLeft))
      }
      toast("Mock test ready — good luck!", "success")
      if (data.usedFallback) {
        toast("Some questions used a notes backup because AI was incomplete", "info")
      }
      onClose()
      navigate(`/mock-test/${data.testId}`)
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to generate mock test"
      toast(msg, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mock-test-setup-title"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h3 id="mock-test-setup-title" className="type-h3">Configure Mock Test</h3>
            <p className="type-sm mt-1 text-[var(--color-text-secondary)] truncate">
              {topic || "Your notes"} · Free
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="type-label mb-2">Difficulty</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficulty(d.id)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
                difficulty === d.id
                  ? "border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <p className="type-label mb-2">Number of questions</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuestionCount(n)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
                questionCount === n
                  ? "border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleStart} loading={loading} icon={<Sparkles size={16} />}>
            {loading ? "Generating…" : "Generate & Start"}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default MockTestCTA
