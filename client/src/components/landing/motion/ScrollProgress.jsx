import { motion, useScroll, useSpring } from "motion/react"
import { usePrefersReducedMotion } from "./usePrefersReducedMotion"

export default function ScrollProgress() {
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 })

  if (reduced) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-[#7C5CFF] via-[#4F8BFF] to-[#A855F7]"
      style={{ scaleX }}
    />
  )
}
