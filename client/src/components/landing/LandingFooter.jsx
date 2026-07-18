import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Sparkles } from "lucide-react"
import BrandLogo from "../ui/BrandLogo"
import { BRAND_NAME } from "../../constants/brand"
import BloomHeading from "./motion/BloomHeading"
import PremiumButton from "./motion/PremiumButton"
import SectionReveal from "./motion/SectionReveal"

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
    { label: "Contact", href: "#contact" },
  ],
}

export default function LandingFooter() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)

  const scrollTo = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <footer className="border-t border-white/[0.08]">
      <div className="px-3 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <SectionReveal>
          <div className="max-w-4xl mx-auto text-center premium-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFF]/15 via-transparent to-[#4F8BFF]/10 pointer-events-none" />
            <div className="relative">
              <Sparkles className="text-[#A855F7] mx-auto mb-5 icon-lift" size={36} />
              <BloomHeading
                text="Start studying smarter today"
                className="type-h1"
                compact
                subtitle={`Join students using ${BRAND_NAME} to prepare faster. 100 free credits — no card required.`}
              />
              <div className="mt-2">
                <PremiumButton
                  size="lg"
                  onClick={() => navigate(userData ? "/dashboard" : "/signup")}
                  icon={<Sparkles size={18} />}
                >
                  {userData ? "Go to Dashboard" : "Get Started Free"}
                </PremiumButton>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>

      {/* Always-dark band — use light text so contrast works in light and dark themes */}
      <div className="bg-[#0A0F1E] px-4 sm:px-6 lg:px-8 py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2">
            <BrandLogo showTagline onDark className="mb-4" />
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Generate exam-focused notes, revision sheets, diagrams, and practice questions
              powered by Google Gemini — built for Indian students.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map(({ label, href, to }) => (
                <li key={label}>
                  {to ? (
                    <Link
                      to={to}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollTo(href)}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith("#") ? (
                    <button
                      onClick={() => scrollTo(href)}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {label}
                    </button>
                  ) : (
                    <a
                      href={href}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Powered by Google Gemini
          </div>
        </div>
      </div>
    </footer>
  )
}
