import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "motion/react"
import { useDispatch } from "react-redux"
import { HiCheckCircle } from "react-icons/hi2"
import { getCurrentUser } from "../services/api"
import api from "../services/http"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import BrandLogo from "../components/ui/BrandLogo"
import AmbientBackground from "../components/landing/motion/AmbientBackground"

export default function PaymentSuccess() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [statusText, setStatusText] = useState("Confirming your payment…")

  useEffect(() => {
    let cancelled = false
    const sessionId = searchParams.get("session_id")

    const run = async () => {
      try {
        if (sessionId) {
          await api.post("/api/credit/confirm", { sessionId })
        }
        if (!cancelled) setStatusText("Your credits have been added to your account.")
        await getCurrentUser(dispatch)
      } catch (error) {
        console.error("Payment confirm failed:", error)
        if (!cancelled) {
          setStatusText(
            "Payment received. If credits are missing, refresh the dashboard in a moment."
          )
        }
        try {
          await getCurrentUser(dispatch)
        } catch {
          /* ignore */
        }
      }
    }

    run()
    const t = setTimeout(() => navigate("/dashboard"), 5000)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [dispatch, navigate, searchParams])

  return (
    <div className="app-shell relative min-h-screen flex flex-col overflow-hidden">
      <AmbientBackground variant="app" />
      <header className="relative z-10 px-6 py-5">
        <BrandLogo showTagline />
      </header>
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card glass className="text-center max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-6"
            >
              <HiCheckCircle className="text-4xl text-emerald-500" />
            </motion.div>

            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Payment Successful
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">{statusText}</p>

            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Start Generating Notes
            </Button>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              Redirecting to dashboard in 5 seconds…
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
