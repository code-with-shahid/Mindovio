import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { useDispatch } from "react-redux"
import { HiXCircle } from "react-icons/hi2"
import { getCurrentUser } from "../services/api"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import BrandLogo from "../components/ui/BrandLogo"

export default function PaymentFailed() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    getCurrentUser(dispatch)
    const t = setTimeout(() => navigate("/pricing"), 5000)
    return () => clearTimeout(t)
  }, [dispatch, navigate])

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="px-6 py-5">
        <BrandLogo showTagline />
      </header>
      <div className="flex-1 flex items-center justify-center p-4 pb-16">
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
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6"
            >
              <HiXCircle className="text-4xl text-red-500" />
            </motion.div>

            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Payment Failed
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Something went wrong. No charges were made to your account.
            </p>

            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/pricing")} className="w-full">
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
                Go Home
              </Button>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              Redirecting to credits in 5 seconds…
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
