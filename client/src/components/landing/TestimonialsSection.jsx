import { motion } from "motion/react"
import { Star } from "lucide-react"
import BloomHeading from "./motion/BloomHeading"
import { StaggerChildren, staggerItem } from "./motion/SectionReveal"

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
    <section id="testimonials" className="section-gap-lg px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BloomHeading
          eyebrow="Testimonials"
          text="Loved by students across India"
          subtitle="From board exams to competitive tests — see why thousands of students trust Mindovio."
        />

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6" stagger={0.08}>
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              className="premium-card rounded-2xl p-6 flex flex-col group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7C5CFF]/30 to-[#4F8BFF]/20 text-[#A855F7] flex items-center justify-center text-sm font-semibold border border-white/10">
                  {t.avatar}
                </div>
                <div>
                  <p className="type-h4 text-[var(--color-text-primary)]">{t.name}</p>
                  <p className="type-caption text-[var(--color-text-muted)]">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3 text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="type-sm leading-relaxed flex-1 text-[var(--color-text-secondary)]">“{t.quote}”</p>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
