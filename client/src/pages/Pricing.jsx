import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import axios from "axios"
import { HiCheck, HiSparkles } from "react-icons/hi2"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import Card from "../components/ui/Card"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import { useToast } from "../context/ToastContext"
import { serverUrl } from "../config"

const plans = [
  {
    title: "Starter",
    price: "₹100",
    amount: 100,
    credits: "50 Credits",
    description: "Perfect for quick revisions",
    features: ["Generate AI notes", "Exam-focused answers", "Diagram & chart support", "Fast generation"],
  },
  {
    title: "Popular",
    price: "₹200",
    amount: 200,
    credits: "120 Credits",
    description: "Best value for students",
    features: ["All Starter features", "More credits per ₹", "Revision mode access", "Priority AI response"],
    popular: true,
  },
  {
    title: "Pro Learner",
    price: "₹500",
    amount: 500,
    credits: "300 Credits",
    description: "For serious exam preparation",
    features: ["Maximum credit value", "Unlimited revisions", "Charts & diagrams", "Ideal for full syllabus"],
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedPrice, setSelectedPrice] = useState(200)
  const [paying, setPaying] = useState(false)
  const [payingAmount, setPayingAmount] = useState(null)
  const [error, setError] = useState("")

  const handlePay = async (amount) => {
    try {
      setError("")
      setPayingAmount(amount)
      setPaying(true)
      const result = await axios.post(serverUrl + "/api/credit/order", { amount }, { withCredentials: true })
      if (result.data.url) {
        window.location.href = result.data.url
        return
      }
      setError("Payment link was not returned. Please try again.")
      toast("Couldn’t start checkout", "error")
    } catch (err) {
      console.error(err)
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Payment failed to start. Please try again."
      setError(message)
      toast(message, "error")
    } finally {
      setPaying(false)
      setPayingAmount(null)
    }
  }

  return (
    <DashboardLayout>
      <DashboardTopbar title="Buy Credits" subtitle="Choose a plan that fits your study needs" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <Badge color="brand" className="mb-3">
          <HiSparkles /> Credit Plans
        </Badge>
        <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
          Each note generation costs 10 credits. Choose the plan that matches your study schedule.
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <div className="max-w-5xl mx-auto mb-6">
            <Alert variant="error" onDismiss={() => setError("")}>
              {error}
            </Alert>
          </div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto min-w-0">
        {plans.map((plan, i) => (
          <PricingCard
            key={plan.title}
            {...plan}
            delay={i * 0.1}
            selected={selectedPrice === plan.amount}
            onSelect={() => setSelectedPrice(plan.amount)}
            onBuy={() => handlePay(plan.amount)}
            paying={paying && payingAmount === plan.amount}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <Button variant="ghost" onClick={() => navigate("/notes")}>
          Back to Generate
        </Button>
      </div>
    </DashboardLayout>
  )
}

function PricingCard({
  title, price, credits, description, features, popular,
  selected, onSelect, onBuy, paying, delay,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <Card
        hover
        glass
        className={`h-full relative transition-all duration-300 ${
          selected ? "ring-2 ring-brand-500 shadow-lg shadow-brand-500/10" : ""
        }`}
      >
        {popular && (
          <Badge color="brand" className="absolute -top-3 left-1/2 -translate-x-1/2">
            Most Popular
          </Badge>
        )}

        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>

        <div className="mt-6 mb-6">
          <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">{price}</span>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-1">{credits}</p>
        </div>

        <Button
          className="w-full mb-6"
          variant={selected ? "primary" : "outline"}
          disabled={paying}
          loading={paying}
          onClick={(e) => { e.stopPropagation(); onBuy() }}
        >
          {paying ? "Redirecting…" : "Buy Now"}
        </Button>

        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
              <HiCheck className="text-emerald-500 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  )
}
