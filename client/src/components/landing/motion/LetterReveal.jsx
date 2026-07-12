import { motion } from "motion/react"
import { usePrefersReducedMotion, viewportOnce } from "./usePrefersReducedMotion"

const DEFAULT_GRADIENT_WORDS = new Set([
  "ai",
  "powered",
  "smart",
  "study",
  "assistant",
  "learning",
  "generate",
  "notes",
  "revision",
  "smarter",
  "exam",
  "exams",
  "mindovio",
])

const container = (delay = 0.02) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: delay, delayChildren: 0.05 },
  },
})

/* No filter/blur — blur + transparent text caused invisible headings */
const letterVar = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

function splitToTokens(text) {
  return text.split(/(\s+)/).filter((t) => t.length > 0)
}

/**
 * Letter-by-letter reveal. Gradient words use accent color with optional
 * animated gradient enhancement — never transparent-only text.
 */
export default function LetterReveal({
  text,
  as: Tag = "h1",
  className = "",
  gradientWords = DEFAULT_GRADIENT_WORDS,
  stagger = 0.02,
  glow = false,
  cursor = false,
  play = "view", // "view" | "mount"
}) {
  const reduced = usePrefersReducedMotion()
  const tokens = splitToTokens(text)

  const motionProps =
    play === "mount"
      ? { initial: "hidden", animate: "visible" }
      : { initial: "hidden", whileInView: "visible", viewport: viewportOnce }

  const renderTokens = (animated) =>
    tokens.map((token, ti) => {
      const isSpace = /^\s+$/.test(token)
      if (isSpace) {
        return <span key={`s-${ti}`}>{token}</span>
      }
      const clean = token.replace(/[^a-zA-Z]/g, "").toLowerCase()
      const useGradient = gradientWords.has(clean)

      if (!animated) {
        return (
          <span key={`w-${ti}`} className={useGradient ? "gradient-text-safe" : undefined}>
            {token}
          </span>
        )
      }

      return (
        <span key={`w-${ti}`} className="inline-block whitespace-pre">
          {token.split("").map((ch, ci) => (
            <motion.span
              key={`${ti}-${ci}`}
              variants={letterVar}
              className={`inline-block ${useGradient ? "gradient-text-safe" : ""}`}
              style={{ willChange: "transform, opacity" }}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          ))}
        </span>
      )
    })

  if (reduced) {
    return (
      <Tag className={`${className} ${glow ? "text-glow" : ""} heading-visible`}>
        {renderTokens(false)}
        {cursor && <span className="hero-cursor" aria-hidden />}
      </Tag>
    )
  }

  return (
    <Tag className={`${className} ${glow ? "text-glow" : ""} heading-visible`}>
      <motion.span
        className="inline"
        variants={container(stagger)}
        {...motionProps}
        aria-label={text}
      >
        {renderTokens(true)}
      </motion.span>
      {cursor && <span className="hero-cursor" aria-hidden />}
    </Tag>
  )
}
