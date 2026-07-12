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
        whileHover: { y: -3, transition: { duration: 0.2 } },
        ...props,
      }
    : props

  return (
    <Wrapper className={`${base} ${padding} ${className}`} {...motionProps}>
      {children}
    </Wrapper>
  )
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`card-title ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = "" }) {
  return <p className={`card-desc ${className}`}>{children}</p>
}

export function CardMeta({ children, className = "" }) {
  return <p className={`card-meta ${className}`}>{children}</p>
}
