import { motion, useScroll, useTransform } from "motion/react"
import { usePrefersReducedMotion } from "./usePrefersReducedMotion"

/**
 * Project-wide ambient backdrop matching the Mindovio reference:
 * soft magenta/purple nebula blooms + small glowing sparkles.
 */

/* Soft diffuse blooms — like the large arrow-marked wash in the mock */
const NEBULA_BLOOMS = [
  {
    // Behind hero / main content (left-center)
    className: "bg-nebula bg-nebula--primary",
    style: { top: "6%", left: "8%", width: "52vw", height: "42vw", maxWidth: "720px", maxHeight: "580px" },
    duration: 16,
    delay: 0,
  },
  {
    // Bottom-right bloom (arrow-marked area)
    className: "bg-nebula bg-nebula--magenta",
    style: { top: "48%", right: "4%", width: "44vw", height: "40vw", maxWidth: "640px", maxHeight: "560px" },
    duration: 20,
    delay: 1.5,
  },
  {
    // Top-right soft wash
    className: "bg-nebula bg-nebula--blue",
    style: { top: "-5%", right: "12%", width: "40vw", height: "36vw", maxWidth: "560px", maxHeight: "480px" },
    duration: 18,
    delay: 0.8,
  },
  {
    // Mid-left secondary
    className: "bg-nebula bg-nebula--violet",
    style: { top: "55%", left: "-6%", width: "38vw", height: "38vw", maxWidth: "520px", maxHeight: "520px" },
    duration: 22,
    delay: 2.2,
  },
  {
    // Center depth bloom
    className: "bg-nebula bg-nebula--core",
    style: { top: "22%", left: "35%", width: "36vw", height: "36vw", maxWidth: "480px", maxHeight: "480px" },
    duration: 14,
    delay: 1,
  },
]

/* Small bright sparkles — like the top arrow-marked glowing point */
const SPARKLES = [
  { top: "14%", left: "22%", size: 6, delay: 0, duration: 5 },
  { top: "18%", left: "48%", size: 4, delay: 1.2, duration: 6 },
  { top: "32%", left: "12%", size: 5, delay: 0.6, duration: 4.5 },
  { top: "42%", left: "68%", size: 7, delay: 2, duration: 5.5 },
  { top: "58%", left: "28%", size: 4, delay: 1.8, duration: 7 },
  { top: "62%", left: "78%", size: 5, delay: 0.4, duration: 5 },
  { top: "28%", left: "82%", size: 4, delay: 2.4, duration: 6.5 },
  { top: "72%", left: "55%", size: 6, delay: 1.1, duration: 5.2 },
  { top: "8%", left: "72%", size: 3, delay: 3, duration: 4.8 },
  { top: "78%", left: "18%", size: 4, delay: 2.8, duration: 6.2 },
]

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 13 + 4) % 97}%`,
  top: `${(i * 21 + 6) % 93}%`,
  size: 1 + (i % 2),
  duration: 18 + (i % 7) * 2,
  delay: i * 0.35,
  opacity: 0.15 + (i % 5) * 0.06,
}))

export default function AmbientBackground({ variant = "app" }) {
  const reduced = usePrefersReducedMotion()
  const rich = variant === "landing" || variant === "app"
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, rich ? 48 : 0])

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ambient-root ambient-${variant}`}
      aria-hidden
    >
      {/* Deep space base */}
      <div className="ambient-base absolute inset-0" />

      {/* Soft color atmosphere */}
      <div className="ambient-wash absolute inset-0" />

      {/* Nebula blooms (reference arrow targets) */}
      <motion.div className="absolute inset-0" style={reduced || !rich ? undefined : { y }}>
        {NEBULA_BLOOMS.slice(0, rich ? 5 : 2).map((b, i) => (
          <span
            key={i}
            className={`${b.className}${reduced ? " bg-nebula--static" : ""}`}
            style={{
              ...b.style,
              animationDuration: reduced ? undefined : `${b.duration}s`,
              animationDelay: reduced ? undefined : `${b.delay}s`,
            }}
          />
        ))}
      </motion.div>

      {/* Mesh depth */}
      <div className="ambient-mesh absolute inset-0" />

      {/* Aurora sheet */}
      <div className={`ambient-aurora absolute${reduced ? " ambient-aurora--static" : ""}`} />

      {/* Bright sparkle points */}
      {!reduced &&
        rich &&
        SPARKLES.map((s, i) => (
          <span
            key={i}
            className="bg-sparkle absolute"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

      {/* Tiny starfield dust */}
      {!reduced &&
        rich &&
        PARTICLES.map((p) => (
          <span
            key={p.id}
            className="ambient-particle absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ["--p-opacity"]: p.opacity,
            }}
          />
        ))}

      <div className="ambient-hero-light absolute" />
      <div className="ambient-vignette absolute inset-0" />
      {rich && <div className="ambient-grid absolute inset-0" />}
      <div className="ambient-noise absolute inset-0" />
    </div>
  )
}
