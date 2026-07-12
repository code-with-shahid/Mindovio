import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Sparkles,
  CircleCheck,
  FileText,
  GitBranch,
  Zap,
  Star,
  BookOpen,
  Timer,
  Coins,
} from "lucide-react"
import BloomHeading from "./motion/BloomHeading"
import SectionReveal from "./motion/SectionReveal"
import { usePrefersReducedMotion } from "./motion/usePrefersReducedMotion"

const STEPS = ["topic", "generate", "output"]

const mockNotes = {
  topic: "Operating Systems",
  level: "B.Tech · Sem 5",
  exam: "End Semester",
  subTopics: ["Process Scheduling", "Memory Management", "Deadlocks"],
  revisionPoints: [
    "FCFS — non-preemptive, convoy effect",
    "Banker's algorithm prevents unsafe states",
    "Paging eliminates external fragmentation",
  ],
}

export default function DemoPreviewSection() {
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (reduced) {
      setStep(2)
      setProgress(100)
      return
    }

    let alive = true
    const timers = []
    let progressTimer

    const clearAll = () => {
      timers.forEach(clearTimeout)
      timers.length = 0
      if (progressTimer) clearInterval(progressTimer)
    }

    const runCycle = () => {
      if (!alive) return
      clearAll()
      setStep(0)
      setProgress(0)

      timers.push(
        setTimeout(() => {
          if (!alive) return
          setStep(1)
          let p = 0
          progressTimer = setInterval(() => {
            p += 4
            if (p >= 100) {
              clearInterval(progressTimer)
              progressTimer = null
              setProgress(100)
              if (alive) setStep(2)
            } else {
              setProgress(p)
            }
          }, 45)
        }, 1600)
      )

      timers.push(
        setTimeout(() => {
          if (alive) runCycle()
        }, 9000)
      )
    }

    runCycle()
    return () => {
      alive = false
      clearAll()
    }
  }, [reduced])

  const phase = STEPS[step] || "output"

  return (
    <section id="demo" className="section-gap-lg px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[min(28rem,50vw)] w-[min(40rem,90vw)] rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.18),transparent_70%)] blur-2xl"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto relative">
        <BloomHeading
          eyebrow="Live Preview"
          text="See Mindovio in action"
          subtitle="Watch a topic become exam-ready notes, diagrams, and revision points — the same flow you'll use in the dashboard."
        />

        <SectionReveal className="relative max-w-5xl mx-auto mt-2">
          {/* Floating insight chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="absolute -top-3 left-4 sm:left-8 z-20 hidden sm:flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl px-3.5 py-2.5 shadow-lg shadow-[#7C5CFF]/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
              <Timer size={16} />
            </span>
            <div>
              <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Generation time
              </p>
              <p className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
                1m 42s
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="absolute -bottom-3 right-4 sm:right-8 z-20 hidden sm:flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl px-3.5 py-2.5 shadow-lg shadow-[#7C5CFF]/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#A855F7]/15 text-[#A855F7]">
              <Coins size={16} />
            </span>
            <div>
              <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Credits used
              </p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                10 <span className="text-[var(--color-text-muted)] font-medium">/ 50</span>
              </p>
            </div>
          </motion.div>

          <div className="relative rounded-[1.75rem] p-[1px] bg-gradient-to-br from-[#7C5CFF]/70 via-[#4F8BFF]/40 to-[#A855F7]/50 shadow-2xl shadow-[#7C5CFF]/20">
            <div className="rounded-[1.7rem] overflow-hidden bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
              {/* Window chrome */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/80">
                <div className="flex gap-1.5 shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mx-auto max-w-sm truncate rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-center text-[11px] text-[var(--color-text-muted)]">
                    app.mindovio.com/notes
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </div>
              </div>

              {/* Pipeline tabs */}
              <div className="flex gap-1 px-4 sm:px-6 pt-4 pb-2">
                {[
                  { id: "topic", label: "1. Topic", icon: BookOpen },
                  { id: "generate", label: "2. Generate", icon: Sparkles },
                  { id: "output", label: "3. Study guide", icon: FileText },
                ].map((tab, i) => {
                  const active = step >= i
                  const Icon = tab.icon
                  return (
                    <div
                      key={tab.id}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] sm:text-xs font-semibold transition-colors ${
                        active
                          ? "bg-brand-500/12 text-brand-600 dark:text-brand-300"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      <Icon size={13} />
                      <span className="truncate">{tab.label}</span>
                    </div>
                  )
                })}
              </div>

              <div className="px-4 sm:px-6 pb-6 pt-2 grid lg:grid-cols-5 gap-4 lg:gap-5">
                {/* Input panel */}
                <div className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8BFF] text-white shadow-md shadow-[#7C5CFF]/30">
                      <Sparkles size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Generate Notes
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        Exam-focused · Gemini powered
                      </p>
                    </div>
                  </div>

                  <MockField label="Topic" value={mockNotes.topic} highlight={phase === "topic"} />
                  <MockField label="Class Level" value={mockNotes.level} />
                  <MockField label="Exam Type" value={mockNotes.exam} />

                  <div className="flex flex-wrap gap-2">
                    <MockChip active>Revision Mode</MockChip>
                    <MockChip active>Diagram</MockChip>
                    <MockChip>Charts</MockChip>
                  </div>

                  <div className="relative overflow-hidden rounded-xl">
                    <div className="w-full py-2.5 rounded-xl premium-btn-primary text-white text-sm font-semibold text-center relative z-10">
                      {phase === "generate" ? "Generating…" : "Generate Notes"}
                    </div>
                    {phase === "generate" && (
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>

                  {phase === "generate" && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
                        <span>Building study guide</span>
                        <span className="tabular-nums">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#4F8BFF]"
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Output panel */}
                <div className="lg:col-span-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 min-h-[320px] relative overflow-hidden">
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#7C5CFF]/10 blur-3xl"
                    aria-hidden
                  />

                  <AnimatePresence mode="wait">
                    {phase !== "output" ? (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full min-h-[280px] flex flex-col items-center justify-center text-center px-4"
                      >
                        <motion.div
                          animate={
                            reduced
                              ? undefined
                              : { scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }
                          }
                          transition={{ duration: 2.4, repeat: Infinity }}
                          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-500"
                        >
                          {phase === "generate" ? <Sparkles size={26} /> : <BookOpen size={26} />}
                        </motion.div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {phase === "generate"
                            ? "Crafting your exam notes…"
                            : "Ready when you generate"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)] max-w-xs">
                          {phase === "generate"
                            ? "Structuring subtopics, diagrams, and revision points from your syllabus."
                            : "Enter a topic and Mindovio builds a complete study guide in minutes."}
                        </p>
                        {phase === "generate" && (
                          <div className="mt-5 flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                className="h-1.5 w-1.5 rounded-full bg-brand-500"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                  duration: 0.9,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 relative"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                              Generated Output
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted)]">
                              {mockNotes.topic}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CircleCheck size={13} /> Ready
                          </span>
                        </div>

                        <div className="rounded-xl border border-[#F5C542]/30 bg-gradient-to-r from-[#F5C542]/12 to-transparent px-3 py-2.5 flex items-center gap-2">
                          <div className="flex gap-0.5 text-[#E5A70E]">
                            {[0, 1, 2].map((i) => (
                              <Star key={i} size={14} fill="currentColor" />
                            ))}
                          </div>
                          <p className="text-xs font-medium text-[var(--color-text-primary)]">
                            Frequently Asked · High exam weightage
                          </p>
                        </div>

                        <div>
                          <p className="type-caption mb-2">Sub topics</p>
                          <div className="flex flex-wrap gap-2">
                            {mockNotes.subTopics.map((t, i) => (
                              <motion.span
                                key={t}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.08 }}
                                className="text-xs px-2.5 py-1 rounded-full border border-brand-500/25 bg-brand-500/10 text-brand-600 dark:text-brand-300 font-medium"
                              >
                                {t}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/70 p-3.5">
                          <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1.5 flex items-center gap-1.5">
                            <FileText size={14} className="text-brand-500" />
                            Process Scheduling
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                            CPU scheduling allocates processes to the CPU. Key algorithms include
                            FCFS, SJF, and Round Robin — each with trade-offs for waiting time and
                            fairness.
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="rounded-xl border border-[var(--color-border)] p-3.5 relative overflow-hidden">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-3 flex items-center gap-1">
                              <GitBranch size={12} className="text-brand-500" />
                              Mermaid diagram
                            </p>
                            <MiniFlowDiagram />
                          </div>
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                              <Zap size={12} />
                              Quick revision
                            </p>
                            <ul className="space-y-1.5">
                              {mockNotes.revisionPoints.map((p) => (
                                <li
                                  key={p}
                                  className="text-[11px] text-[var(--color-text-secondary)] flex gap-2 leading-snug"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}

function MockField({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">{label}</p>
      <div
        className={`px-3 py-2 rounded-xl text-xs font-medium text-[var(--color-text-primary)] border transition-shadow ${
          highlight
            ? "border-brand-500/50 bg-brand-500/8 shadow-[0_0_0_3px_rgba(124,92,255,0.12)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)]"
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function MockChip({ children, active }) {
  return (
    <span
      className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${
        active
          ? "bg-brand-500/12 border-brand-500/35 text-brand-600 dark:text-brand-300"
          : "border-[var(--color-border)] text-[var(--color-text-muted)]"
      }`}
    >
      {children}
    </span>
  )
}

function MiniFlowDiagram() {
  return (
    <svg viewBox="0 0 180 72" className="w-full h-auto text-brand-500" aria-hidden>
      <defs>
        <linearGradient id="demoFlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#4F8BFF" />
        </linearGradient>
      </defs>
      <rect x="4" y="22" width="44" height="28" rx="8" fill="url(#demoFlow)" opacity="0.9" />
      <text x="26" y="40" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">
        Ready
      </text>
      <path
        d="M52 36 H72"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        opacity="0.5"
      />
      <rect
        x="72"
        y="22"
        width="44"
        height="28"
        rx="8"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="1"
      />
      <text
        x="94"
        y="40"
        textAnchor="middle"
        className="fill-[var(--color-text-primary)]"
        fontSize="8"
        fontWeight="600"
      >
        Running
      </text>
      <path
        d="M120 36 H140"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        opacity="0.5"
      />
      <rect
        x="140"
        y="22"
        width="36"
        height="28"
        rx="8"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <text
        x="158"
        y="40"
        textAnchor="middle"
        className="fill-[var(--color-text-primary)]"
        fontSize="8"
        fontWeight="600"
      >
        Wait
      </text>
    </svg>
  )
}
