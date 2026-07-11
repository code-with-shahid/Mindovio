import { motion } from "motion/react"
import { HiStar } from "react-icons/hi2"

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Class 12 · CBSE Board",
    avatar: "PS",
    rating: 5,
    quote:
      "Mindovio saved me hours before my Physics board exam. The revision mode cheat sheet was exactly what I needed for last-minute prep.",
  },
  {
    name: "Arjun Mehta",
    role: "B.Tech CSE · Semester 5",
    avatar: "AM",
    rating: 5,
    quote:
      "The auto-generated flowcharts for Operating Systems were better than anything I could draw manually. My assignment score went from 72 to 91.",
  },
  {
    name: "Sneha Reddy",
    role: "NEET Aspirant",
    avatar: "SR",
    rating: 5,
    quote:
      "I use it daily for Biology and Chemistry. The priority-ranked sub-topics help me focus on high-yield areas. Worth every credit.",
  },
  {
    name: "Rahul Verma",
    role: "GATE · Computer Science",
    avatar: "RV",
    rating: 5,
    quote:
      "Structured notes with short and long questions in one click. The PDF export makes it easy to revise offline during commute.",
  },
  {
    name: "Ananya Patel",
    role: "Class 10 · ICSE",
    avatar: "AP",
    rating: 5,
    quote:
      "My mom was skeptical about AI study tools, but the quality of notes convinced her. Clean, exam-focused, no fluff.",
  },
  {
    name: "Karthik Nair",
    role: "MBA · Finance",
    avatar: "KN",
    rating: 5,
    quote:
      "Used it for corporate finance revision before finals. Charts showing topic weightage were surprisingly accurate and helpful.",
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-elevated)]/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Loved by students across India
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            From board exams to competitive tests — see why thousands of students trust Mindovio.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <HiStar key={j} className="text-amber-400 text-sm" />
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                <div className="h-10 w-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
