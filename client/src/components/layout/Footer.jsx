import { Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { useDispatch } from "react-redux"
import axios from "axios"
import logo from "../../assets/logo.png"
import { serverUrl } from "../../config"
import { setUserData } from "../../redux/userSlice"

const links = {
  product: [
    { label: "Generate Notes", to: "/notes" },
    { label: "History", to: "/history" },
    { label: "Pricing", to: "/pricing" },
  ],
  company: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
  ],
}

export default function Footer() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSignOut = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/auth")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="ExamNotes AI" className="h-9 w-9 rounded-lg" />
              <span className="text-lg font-bold text-[var(--color-text-primary)]">
                ExamNotes<span className="text-brand-600 dark:text-brand-400">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
              AI-powered exam preparation platform. Generate structured notes, revision points,
              diagrams, and practice questions in seconds.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Product</h4>
            <ul className="space-y-3">
              {links.product.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-[var(--color-text-secondary)] hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Resources</h4>
            <ul className="space-y-3">
              {links.company.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-[var(--color-text-secondary)] hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <button onClick={handleSignOut} className="text-sm text-red-500 hover:text-red-400 transition-colors">
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} ExamNotes AI. Built for students, by students.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Powered by Google Gemini
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
