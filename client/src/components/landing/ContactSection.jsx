import { useState } from "react"
import { motion } from "motion/react"
import {
  Bug,
  Clock,
  Headphones,
  Lightbulb,
  Mail,
  Send,
} from "lucide-react"
import BloomHeading from "./motion/BloomHeading"
import SectionReveal from "./motion/SectionReveal"
import PremiumButton from "./motion/PremiumButton"
import { BRAND_EMAIL, BRAND_NAME } from "../../constants/brand"
import { useToast } from "../../context/ToastContext"

const SUBJECTS = [
  { id: "bug", label: "Bug Report", icon: Bug },
  { id: "feature", label: "Feature Request", icon: Lightbulb },
  { id: "support", label: "Support", icon: Headphones },
  { id: "general", label: "General Inquiry", icon: Mail },
]

const INFO_CARDS = [
  {
    icon: Mail,
    title: "Email Us",
    body: BRAND_EMAIL,
    href: `mailto:${BRAND_EMAIL}`,
    highlight: true,
  },
  {
    icon: Bug,
    title: "Bug Reports",
    body: "Found something broken? Tell us and we’ll fix it fast.",
  },
  {
    icon: Lightbulb,
    title: "Feature Requests",
    body: `Have an idea to improve ${BRAND_NAME}? We’d love to hear it.`,
  },
  {
    icon: Headphones,
    title: "Support",
    body: "Need help with notes, mock tests, credits, or your account?",
  },
  {
    icon: Clock,
    title: "Response Time",
    body: "We typically respond within 24–48 hours.",
  },
]

export default function ContactSection() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("support")
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast("Please fill in name, email, and message", "error")
      return
    }

    const subjectLabel = SUBJECTS.find((s) => s.id === subject)?.label || "Support"
    const mailSubject = encodeURIComponent(`[${BRAND_NAME}] ${subjectLabel} — ${name.trim()}`)
    const mailBody = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subjectLabel}\n\n${message.trim()}`
    )
    window.location.href = `mailto:${BRAND_EMAIL}?subject=${mailSubject}&body=${mailBody}`
    toast("Opening your email app…", "success")
  }

  return (
    <section id="contact" className="section-gap-lg px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BloomHeading
          eyebrow="Contact"
          text="Need help?"
          subtitle={`Experiencing an issue, found a bug, or have a suggestion? Reach out — we’re here for ${BRAND_NAME} students.`}
        />

        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] gap-6 lg:gap-8 items-start">
          <SectionReveal className="space-y-3">
            {INFO_CARDS.map(({ icon: Icon, title, body, href, highlight }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="contact-panel rounded-2xl p-4 sm:p-5 flex gap-3.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
                  {href ? (
                    <a
                      href={href}
                      className="type-sm mt-1 block break-all font-medium text-brand-700 dark:text-brand-300 hover:underline"
                    >
                      {body}
                    </a>
                  ) : (
                    <p
                      className={`type-sm mt-1 ${
                        highlight
                          ? "font-medium text-brand-700 dark:text-brand-300"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {body}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <form
              onSubmit={handleSubmit}
              className="contact-panel rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 space-y-5"
            >
              <div>
                <h3 className="type-h3 text-[var(--color-text-primary)]">Send a message</h3>
                <p className="type-sm mt-1 text-[var(--color-text-secondary)]">
                  Experiencing an issue, found a bug, or have a suggestion? We’d love to hear from
                  you.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block min-w-0">
                  <span className="ui-label">Name</span>
                  <input
                    type="text"
                    name="name"
                    id="contact-name"
                    className="ui-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="block min-w-0">
                  <span className="ui-label">Email</span>
                  <input
                    type="email"
                    name="email"
                    id="contact-email"
                    className="ui-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
              </div>

              <fieldset>
                <legend className="ui-label">Subject</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {SUBJECTS.map(({ id, label, icon: Icon }) => {
                    const active = subject === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSubject(id)}
                        className={`contact-chip rounded-xl px-2.5 py-3 text-center transition-colors ${
                          active ? "is-active" : ""
                        }`}
                      >
                        <Icon size={16} className="mx-auto mb-1.5" />
                        <span className="block text-[11px] sm:text-xs font-semibold leading-tight">
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <label className="block">
                <span className="ui-label">Message</span>
                <textarea
                  name="message"
                  id="contact-message"
                  className="ui-input min-h-[140px] resize-y"
                  placeholder="Describe your issue, bug, or suggestion in detail…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>

              <PremiumButton type="submit" size="lg" className="w-full" icon={<Send size={16} />}>
                Send Message
              </PremiumButton>
              <p className="type-caption text-center text-[var(--color-text-muted)]">
                Opens your email app to message{" "}
                <span className="text-[var(--color-text-secondary)]">{BRAND_EMAIL}</span>
              </p>
            </form>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
