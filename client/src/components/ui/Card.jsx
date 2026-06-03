import { motion } from "motion/react"

export default function Card({
  children,
  className = "",
  hover = false,
  glass = false,
  padding = "p-6",
  ...props
}) {
  const base = glass
    ? "glass rounded-2xl"
    : "bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl shadow-sm"

  const Wrapper = hover ? motion.div : "div"
  const motionProps = hover
    ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
        ...props,
      }
    : props

  return (
    <Wrapper className={`${base} ${padding} ${className}`} {...motionProps}>
      {children}
    </Wrapper>
  )
}
