import { motion } from "motion/react"
import LetterReveal from "./LetterReveal"
import { usePrefersReducedMotion, viewportOnce } from "./usePrefersReducedMotion"

/**
 * Section heading: badge + letter stagger + subtitle.
 * No filter blur — keeps headings fully readable.
 */
export default function BloomHeading({
  text,
  as = "h2",
  className = "type-h1",
  subtitle,
  eyebrow,
  compact = false,
  align = "center",
}) {
  const reduced = usePrefersReducedMotion()
  const alignCls = align === "left" ? "text-left" : "text-center"
  const subAlign = align === "left" ? "mr-auto" : "mx-auto"

  return (
    <div className={`${alignCls} ${compact ? "mb-8" : "mb-14 lg:mb-16"}`}>
      {eyebrow && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.4 }}
          className={`mb-4 ${align === "center" ? "flex justify-center" : ""}`}
        >
          <span className="landing-badge">
            <span className="landing-badge-dot" aria-hidden />
            {eyebrow}
          </span>
        </motion.div>
      )}

      <div className={`bloom-heading inline-block max-w-4xl ${align === "center" ? "" : "w-full"}`}>
        <LetterReveal text={text} as={as} className={className} glow />
      </div>

      {subtitle && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.12 }}
          className={`type-body-lg max-w-2xl mt-5 text-[var(--color-text-secondary)] ${subAlign}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
