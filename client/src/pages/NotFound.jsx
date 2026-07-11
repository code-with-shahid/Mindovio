import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { HiHome, HiSparkles } from "react-icons/hi2"
import BrandLogo from "../components/ui/BrandLogo"
import Button from "../components/ui/Button"
import { BRAND_NAME } from "../constants/brand"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="px-6 py-5">
        <BrandLogo showTagline />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <p className="text-7xl font-extrabold gradient-text mb-4">404</p>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Page not found
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            This page doesn’t exist in {BRAND_NAME}. Head home or jump into the dashboard to generate notes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/")} icon={<HiHome />}>
              Go Home
            </Button>
            <Button variant="secondary" onClick={() => navigate("/dashboard")} icon={<HiSparkles />}>
              Open Dashboard
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
