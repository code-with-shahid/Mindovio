import { motion } from "motion/react"
import Card, { CardDescription, CardTitle } from "./Card"
import { staggerItem } from "../landing/motion/SectionReveal"

export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div variants={staggerItem} className="h-full">
      <Card hover={false} glass className="h-full group premium-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5CFF]/25 to-[#4F8BFF]/15 text-[#A855F7] mb-5 border border-white/10">
          <Icon className="icon-lift" size={22} strokeWidth={1.75} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </Card>
    </motion.div>
  )
}
