import { motion } from "motion/react"
import {
  HiSparkles,
  HiCheckCircle,
  HiDocumentText,
  HiChartBar,
  HiBolt,
} from "react-icons/hi2"

const mockNotes = {
  topic: "Operating Systems",
  importance: "⭐⭐⭐",
  subTopics: ["Process Scheduling", "Memory Management", "Deadlocks"],
  revisionPoints: [
    "FCFS — non-preemptive, convoy effect",
    "Banker's algorithm prevents unsafe states",
    "Paging eliminates external fragmentation",
  ],
}

export default function DemoPreviewSection() {
  return (
    <section id="demo" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
            Live Preview
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            See ExamNotesAI in action
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            A glimpse of the structured, exam-ready output you'll get in under two minutes.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Browser chrome */}
          <div className="glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-md mx-auto px-4 py-1 rounded-lg bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-muted)] text-center">
                  app.examnotes.ai/notes
                </div>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="p-4 sm:p-6 lg:p-8 grid lg:grid-cols-5 gap-5 bg-[var(--color-surface-muted)]">
              {/* Form panel */}
              <div className="lg:col-span-2 glass rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <HiSparkles className="text-brand-500" />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">Generate Notes</span>
                </div>
                <MockInput label="Topic" value={mockNotes.topic} />
                <MockInput label="Class Level" value="B.Tech · Sem 5" />
                <MockInput label="Exam Type" value="End Semester" />
                <div className="flex flex-wrap gap-2">
                  <MockToggle label="Revision Mode" active />
                  <MockToggle label="Diagram" active />
                  <MockToggle label="Charts" />
                </div>
                <div className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold text-center">
                  Generate Notes
                </div>
              </div>

              {/* Output panel */}
              <div className="lg:col-span-3 glass rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">Generated Output</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <HiCheckCircle /> Ready
                  </span>
                </div>

                <div className="rounded-lg bg-brand-500/10 border border-brand-500/20 px-3 py-2">
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                    Importance: {mockNotes.importance} Frequently Asked
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Sub Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {mockNotes.subTopics.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2 flex items-center gap-1">
                    <HiDocumentText className="text-sm" /> Notes Preview
                  </p>
                  <div className="rounded-lg bg-[var(--color-surface-elevated)] p-3 text-xs text-[var(--color-text-secondary)] leading-relaxed space-y-1">
                    <p className="font-semibold text-[var(--color-text-primary)]">Process Scheduling</p>
                    <p>CPU scheduling allocates processes to CPU. Key algorithms: FCFS, SJF, Round Robin…</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[var(--color-border)] p-3 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <HiChartBar className="text-brand-500 text-lg" />
                    Mermaid Diagram
                  </div>
                  <div className="rounded-lg border border-[var(--color-border)] p-3">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1">
                      <HiBolt className="text-amber-500" /> Quick Revision
                    </p>
                    <ul className="text-[10px] text-[var(--color-text-secondary)] space-y-0.5">
                      {mockNotes.revisionPoints.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="absolute -left-2 sm:-left-6 top-1/3 glass-strong rounded-xl px-4 py-3 shadow-xl hidden sm:block"
          >
            <p className="text-xs text-[var(--color-text-muted)]">Generation time</p>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">1m 42s</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -right-2 sm:-right-6 bottom-1/4 glass-strong rounded-xl px-4 py-3 shadow-xl hidden sm:block"
          >
            <p className="text-xs text-[var(--color-text-muted)]">Credits used</p>
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400">10 / 50</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function MockInput({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{label}</p>
      <div className="px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]">
        {value}
      </div>
    </div>
  )
}

function MockToggle({ label, active }) {
  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-full border ${
        active
          ? "bg-brand-500/15 border-brand-500/30 text-brand-600 dark:text-brand-400"
          : "border-[var(--color-border)] text-[var(--color-text-muted)]"
      }`}
    >
      {label}
    </span>
  )
}
