import { Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { useSelector } from "react-redux"
import { HiSparkles } from "react-icons/hi2"
import BrandLogo from "../ui/BrandLogo"
import Button from "../ui/Button"
import { BRAND_NAME, BRAND_EMAIL } from "../../constants/brand"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Demo", href: "#demo" },
    { label: "Pricing", to: "/pricing" },
  ],
  support: [
    { label: "FAQ", href: "#faq" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: `mailto:${BRAND_EMAIL}` },
  ],
}

export default function LandingFooter() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)

  const scrollTo = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass-strong rounded-3xl p-10 lg:p-14 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-brand-400/5 pointer-events-none" />
          <div className="relative">
            <HiSparkles className="text-4xl text-brand-600 dark:text-brand-400 mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-3">
              Start studying smarter today
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
              Join students using {BRAND_NAME} to prepare faster. 50 free credits — no card required.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(userData ? "/dashboard" : "/signup")}
              icon={<HiSparkles />}
            >
              {userData ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="bg-[var(--color-surface-elevated)] px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2">
            <BrandLogo showTagline className="mb-4" />
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
              Generate exam-focused notes, revision sheets, diagrams, and practice questions
              powered by Google Gemini — built for Indian students.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map(({ label, href, to }) => (
                <li key={label}>
                  {to ? (
                    <Link to={to} className="text-sm text-[var(--color-text-secondary)] hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {label}
                    </Link>
                  ) : (
                    <button onClick={() => scrollTo(href)} className="text-sm text-[var(--color-text-secondary)] hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith("#") ? (
                    <button onClick={() => scrollTo(href)} className="text-sm text-[var(--color-text-secondary)] hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {label}
                    </button>
                  ) : (
                    <a href={href} className="text-sm text-[var(--color-text-secondary)] hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Powered by Google Gemini
          </div>
        </div>
      </div>
    </footer>
  )
}
