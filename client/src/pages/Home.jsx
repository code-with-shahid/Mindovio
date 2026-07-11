import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { useSelector } from "react-redux"
import {
  HiDocumentText,
  HiChartBar,
  HiArrowDownTray,
  HiBolt,
  HiSparkles,
  HiQuestionMarkCircle,
  HiClock,
  HiShieldCheck,
} from "react-icons/hi2"
import LandingNavbar from "../components/landing/LandingNavbar"
import DemoPreviewSection from "../components/landing/DemoPreviewSection"
import TestimonialsSection from "../components/landing/TestimonialsSection"
import FAQSection from "../components/landing/FAQSection"
import LandingFooter from "../components/landing/LandingFooter"
import FeatureCard from "../components/ui/FeatureCard"
import Button from "../components/ui/Button"
import { BRAND_NAME, BRAND_TAGLINE } from "../constants/brand"
import img from "../assets/indian-students.png"

const features = [
  {
    icon: HiDocumentText,
    title: "Exam-Focused Notes",
    description: "Structured, high-yield notes with priority-ranked sub-topics and markdown formatting tailored to your syllabus.",
  },
  {
    icon: HiChartBar,
    title: "Diagrams & Charts",
    description: "Auto-generated Mermaid flowcharts and interactive Recharts visualizations for complex concepts.",
  },
  {
    icon: HiBolt,
    title: "Revision Mode",
    description: "One-click switch to ultra-concise cheat-sheet format — perfect for last-day exam prep.",
  },
  {
    icon: HiQuestionMarkCircle,
    title: "Practice Questions",
    description: "Short, long, and diagram-based questions generated alongside every note set.",
  },
  {
    icon: HiArrowDownTray,
    title: "PDF Export",
    description: "Download clean, printable PDFs with notes, revision points, and questions instantly.",
  },
  {
    icon: HiClock,
    title: "Note History",
    description: "Every generation is saved. Search, browse, and revisit your notes anytime from the dashboard.",
  },
]

const steps = [
  {
    step: "01",
    icon: HiDocumentText,
    title: "Enter your topic",
    desc: "Type any subject, class level, and exam type — CBSE, JEE, NEET, GATE, or university semesters.",
  },
  {
    step: "02",
    icon: HiSparkles,
    title: "AI generates content",
    desc: "Google Gemini creates structured notes, diagrams, charts, revision points, and practice questions.",
  },
  {
    step: "03",
    icon: HiArrowDownTray,
    title: "Study & export",
    desc: "Review in the dashboard, toggle revision mode, and download as PDF for offline study.",
  },
]

const stats = [
  { value: "50+", label: "Free credits" },
  { value: "< 2 min", label: "Avg. generation" },
  { value: "6+", label: "Output formats" },
  { value: "100%", label: "Exam-focused" },
]

const trustBadges = [
  "Google Gemini AI",
  "Stripe Payments",
  "MongoDB Storage",
  "Secure Google Auth",
]

export default function Home() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)

  const ctaPath = userData ? "/dashboard" : "/signup"
  const ctaLabel = userData ? "Open Dashboard" : "Get Started Free"

  return (
    <div className="min-h-screen mesh-bg">
      <LandingNavbar />

      {/* Hero — brand, headline, support, CTAs, product visual */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-[10%] w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-[5%] w-96 h-96 bg-brand-400/12 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400 mb-4">
              {BRAND_NAME}
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-[var(--color-text-primary)] mb-5">
              {BRAND_TAGLINE}
            </h1>

            <p className="text-lg text-[var(--color-text-secondary)] max-w-xl leading-relaxed mb-8">
              Turn any topic into structured study notes, revision sheets, diagrams, and practice questions — in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate(ctaPath)} icon={<HiSparkles />}>
                {ctaLabel}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-brand-500/15 ring-1 ring-[var(--color-border)]">
              <img
                src={img}
                alt={`${BRAND_NAME} — Indian students studying`}
                className="w-full object-cover aspect-[4/3] object-center"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust + stats — below first viewport */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            {trustBadges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/60"
              >
                <HiShieldCheck className="text-emerald-500" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Features"
            title="Everything you need to ace your exams"
            subtitle="From detailed study notes to quick revision sheets — intelligently generated for your exam format."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-elevated)]/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="How it works"
            title="Three steps to better grades"
            subtitle="No complex setup. Sign in, enter a topic, and let AI do the heavy lifting."
          />

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

            {steps.map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative glass rounded-2xl p-8 text-center"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white mb-5 relative z-10">
                  <Icon className="text-2xl" />
                </div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Step {step}
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-2 mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DemoPreviewSection />
      <TestimonialsSection />
      <FAQSection />
      <LandingFooter />
    </div>
  )
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>
      {subtitle && (
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  )
}
