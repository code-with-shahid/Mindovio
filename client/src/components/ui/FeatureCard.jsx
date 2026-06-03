import { motion } from "motion/react"
import Card from "./Card"

export default function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Card hover glass className="h-full group">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-4 transition-transform duration-300 group-hover:scale-110">
          <Icon className="text-xl" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
      </Card>
    </motion.div>
  )
}
