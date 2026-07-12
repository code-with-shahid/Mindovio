import { motion } from "motion/react"
import { usePrefersReducedMotion } from "./usePrefersReducedMotion"

/**
 * Landing CTA with glow, scale, icon slide, and soft ripple — no route/API changes.
 */
export default function PremiumButton({
  children,
  onClick,
  variant = "primary",
  size = "lg",
  icon,
  iconPosition = "right",
  className = "",
  type = "button",
}) {
  const reduced = usePrefersReducedMotion()

  const sizes = {
    sm: "px-3.5 py-2 text-[0.8125rem] rounded-xl",
    md: "px-5 py-2.5 text-[0.875rem] rounded-xl",
    lg: "px-7 py-3.5 text-[0.9375rem] rounded-2xl",
  }

  const variants = {
    primary: "premium-btn-primary text-white",
    secondary:
      "bg-[#0E1528]/90 text-white border border-white/10 hover:border-[#7C5CFF]/40 hover:bg-[#0E1528] shadow-lg shadow-black/20 dark:bg-[#0E1528]/90",
    ghost: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5",
  }

  const iconEl = icon && (
    <span
      className={`inline-flex transition-transform duration-300 ${
        iconPosition === "right" ? "group-hover:translate-x-1" : "group-hover:-translate-x-0.5"
      }`}
    >
      {icon}
    </span>
  )

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className={`
        group relative inline-flex items-center justify-center gap-2 overflow-hidden
        font-semibold tracking-[-0.01em] transition-shadow duration-300
        ${sizes[size]} ${variants[variant]} ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        {iconPosition === "left" && iconEl}
        {children}
        {iconPosition === "right" && iconEl}
      </span>
      {variant === "primary" && !reduced && (
        <span className="premium-btn-shine pointer-events-none absolute inset-0" aria-hidden />
      )}
      {!reduced && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/0"
          whileTap={{
            backgroundColor: ["rgba(255,255,255,0.18)", "rgba(255,255,255,0)"],
            transition: { duration: 0.45 },
          }}
          aria-hidden
        />
      )}
    </motion.button>
  )
}
