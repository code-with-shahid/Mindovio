import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { useSelector } from "react-redux"
import {
  FileText,
  BarChart3,
  Download,
  Zap,
  Sparkles,
  HelpCircle,
  Clock,
  Shield,
  Play,
  Gift,
  Crosshair,
  Database,
  CreditCard,
} from "lucide-react"
import LandingNavbar from "../components/landing/LandingNavbar"
import DemoPreviewSection from "../components/landing/DemoPreviewSection"
import TestimonialsSection from "../components/landing/TestimonialsSection"
import FAQSection from "../components/landing/FAQSection"
import ContactSection from "../components/landing/ContactSection"
import LandingFooter from "../components/landing/LandingFooter"
import FeatureCard from "../components/ui/FeatureCard"
import { BRAND_NAME, BRAND_TAGLINE } from "../constants/brand"
import img from "../assets/indian-students.png"
import AmbientBackground from "../components/landing/motion/AmbientBackground"
import ScrollProgress from "../components/landing/motion/ScrollProgress"
import LetterReveal from "../components/landing/motion/LetterReveal"
import BloomHeading from "../components/landing/motion/BloomHeading"
import SectionReveal, { StaggerChildren, staggerItem } from "../components/landing/motion/SectionReveal"
import CountUp from "../components/landing/motion/CountUp"
import HeroVisual from "../components/landing/motion/HeroVisual"
import PremiumButton from "../components/landing/motion/PremiumButton"

const features = [
  {
    icon: FileText,
    title: "Exam-Focused Notes",
    description:
      "Structured, high-yield notes with priority-ranked sub-topics and markdown formatting tailored to your syllabus.",
  },
  {
    icon: BarChart3,
    title: "Diagrams & Charts",
    description:
      "Auto-generated Mermaid flowcharts and interactive Recharts visualizations for complex concepts.",
  },
  {
    icon: Zap,
    title: "Revision Mode",
    description:
      "One-click switch to ultra-concise cheat-sheet format — perfect for last-day exam prep.",
  },
  {
    icon: HelpCircle,
    title: "Practice Questions",
    description: "Short, long, and diagram-based questions generated alongside every note set.",
  },
  {
    icon: Download,
    title: "PDF Export",
    description:
      "Download clean, printable PDFs with notes, revision points, and questions instantly.",
  },
  {
    icon: Clock,
    title: "Note History",
    description:
      "Every generation is saved. Search, browse, and revisit your notes anytime from the dashboard.",
  },
]

const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Enter your topic",
    desc: "Type any subject, class level, and exam type — CBSE, JEE, NEET, GATE, or university semesters.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI generates content",
    desc: "Google Gemini creates structured notes, diagrams, charts, revision points, and practice questions.",
  },
  {
    step: "03",
    icon: Download,
    title: "Study & export",
    desc: "Review in the dashboard, toggle revision mode, and download as PDF for offline study.",
  },
]

const stats = [
  { value: "50+", label: "Free credits", icon: Gift },
  { value: "< 2 min", label: "Avg. generation", icon: Zap },
  { value: "6+", label: "Output formats", icon: FileText },
  { value: "100%", label: "Exam-focused", icon: Crosshair },
]

const trustBadges = [
  { label: "Google Gemini AI", icon: Sparkles, color: "text-emerald-400" },
  { label: "Stripe Payments", icon: CreditCard, color: "text-sky-400" },
  { label: "MongoDB Storage", icon: Database, color: "text-green-400" },
  { label: "Secure Auth", icon: Shield, color: "text-violet-400" },
]

export default function Home() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)

  const ctaPath = userData ? "/dashboard" : "/signup"
  const ctaLabel = userData ? "Open Dashboard" : "Get Started Free"

  return (
    <div className="landing-shell relative overflow-x-clip">
      <AmbientBackground variant="app" />
      <ScrollProgress />
      <LandingNavbar />

      {/* Hero — matches mockup: badge, heading, CTAs, tech badges | image */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 lg:pt-40 lg:pb-20 px-3 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-16 items-center min-w-0">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6"
            >
              <span className="landing-badge uppercase tracking-[0.14em] text-[#C4B5FD]">
                {BRAND_NAME}
              </span>
            </motion.div>

            <LetterReveal
              text={BRAND_TAGLINE}
              as="h1"
              className="type-display mb-6"
              glow
              cursor
              play="mount"
              stagger={0.02}
            />

            <SectionReveal delay={0.18} y={16} className="mb-8">
              <p className="type-body-lg max-w-xl text-[var(--color-text-secondary)]">
                Turn any topic into structured study notes, revision sheets, diagrams, and practice
                questions — in seconds.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.24} y={14}>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <PremiumButton
                  size="lg"
                  onClick={() => navigate(ctaPath)}
                  icon={<Sparkles size={18} />}
                >
                  {ctaLabel}
                </PremiumButton>
                <PremiumButton
                  size="lg"
                  variant="secondary"
                  icon={<Play size={16} />}
                  iconPosition="left"
                  onClick={() =>
                    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See how it works
                </PremiumButton>
              </div>
            </SectionReveal>

            <StaggerChildren className="flex flex-wrap gap-2.5" stagger={0.06}>
              {trustBadges.map(({ label, icon: Icon, color }) => (
                <motion.span key={label} variants={staggerItem} className="tech-badge">
                  <Icon size={14} className={color} />
                  {label}
                </motion.span>
              ))}
            </StaggerChildren>
          </div>

          <HeroVisual src={img} alt={`${BRAND_NAME} — Indian students studying`} />
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto stats-bar grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
          {stats.map((s, i) => (
            <CountUp
              key={s.label}
              value={s.value}
              label={s.label}
              icon={s.icon}
              showDivider={i < stats.length - 1}
            />
          ))}
        </div>
      </section>

      <section id="features" className="section-gap-lg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BloomHeading
            eyebrow="Features"
            text="Everything you need to study smarter"
            subtitle="Powerful tools to help you learn, practice and excel."
          />
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6" stagger={0.08}>
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section id="how-it-works" className="section-gap-lg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BloomHeading
            eyebrow="How it works"
            text="Three steps to better grades"
            subtitle="No complex setup. Sign in, enter a topic, and let AI do the heavy lifting."
          />

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#7C5CFF]/35 to-transparent" />

            {steps.map(({ step, icon: Icon, title, desc }, i) => (
              <SectionReveal key={step} delay={i * 0.12}>
                <div className="relative premium-card rounded-2xl p-8 text-center h-full group">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8BFF] text-white mb-5 relative z-10 shadow-lg shadow-[#7C5CFF]/30">
                    <Icon className="icon-lift" size={24} />
                  </div>
                  <span className="type-overline text-[#A855F7]">Step {step}</span>
                  <h3 className="type-h3 mt-2 mb-2 text-[var(--color-text-primary)]">{title}</h3>
                  <p className="type-sm leading-relaxed text-[var(--color-text-secondary)]">{desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <DemoPreviewSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <LandingFooter />
    </div>
  )
}
