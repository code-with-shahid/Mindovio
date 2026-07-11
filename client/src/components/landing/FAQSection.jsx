import { useState } from "react"
import { motion } from "motion/react"
import { HiChevronDown } from "react-icons/hi2"

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Frequently asked questions
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Everything you need to know about Mindovio.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-[var(--color-text-primary)] text-sm sm:text-base">
                  {faq.q}
                </span>
                <HiChevronDown
                  className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimateHeight open={openIndex === i}>
                <p className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {faq.a}
                </p>
              </AnimateHeight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AnimateHeight({ open, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

const faqs = [
  {
    q: "What is Mindovio?",
    a: "Mindovio is an AI-powered study assistant that generates exam-focused notes, revision cheat sheets, flow diagrams, practice questions, and downloadable PDFs — tailored to your class level and exam type.",
  },
  {
    q: "How many credits do I get for free?",
    a: "Every new user receives 50 free credits upon signing up with Google. Each note generation costs 10 credits, so you can create up to 5 full note sets before needing to purchase more.",
  },
  {
    q: "Which exams and subjects are supported?",
    a: "Mindovio works with any academic topic — CBSE, ICSE, JEE, NEET, GATE, university semesters, and more. Simply enter your topic, class level, and exam type for customized output.",
  },
  {
    q: "How long does generation take?",
    a: "Most notes are generated within 1–3 minutes depending on complexity and whether you enable diagrams and charts. You'll see a live progress indicator while the AI works.",
  },
  {
    q: "Can I download my notes as PDF?",
    a: "Yes. Every generated note set can be exported as a clean, printable PDF including sub-topics, detailed notes, revision points, and practice questions.",
  },
  {
    q: "What AI model powers Mindovio?",
    a: "Mindovio uses Google Gemini to produce structured, exam-oriented content. Our prompt engineering ensures consistent JSON output with markdown notes, Mermaid diagrams, and chart data.",
  },
]
