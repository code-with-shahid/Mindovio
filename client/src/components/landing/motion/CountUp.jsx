import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { usePrefersReducedMotion } from "./usePrefersReducedMotion"

function parseStat(value) {
  const prefix = value.startsWith("<") ? "<" : ""
  const suffix = value.replace(/^[<\s]*/, "").replace(/^[\d.]+/, "") || ""
  const numMatch = value.replace(",", "").match(/[\d.]+/)
  const target = numMatch ? parseFloat(numMatch[0]) : 0
  return { prefix: prefix ? "< " : "", target, suffix: suffix.trimStart() }
}

export default function CountUp({ value, label, duration = 1.4, icon: Icon, showDivider = false }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = usePrefersReducedMotion()
  const { prefix, target, suffix } = parseStat(value)
  const [display, setDisplay] = useState(reduced ? target : 0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setDisplay(target)
      return
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, reduced])

  const formatted =
    Number.isInteger(target) ? Math.round(display).toString() : display.toFixed(1)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 py-5 sm:py-6 text-center sm:text-left ${
        showDivider ? "sm:border-r sm:border-white/10 dark:sm:border-white/10" : ""
      }`}
    >
      {Icon && (
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <span className="absolute inset-0 rounded-full bg-[#7C5CFF]/25 blur-md" aria-hidden />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0E1528]/80 text-[#A855F7]">
            <Icon size={20} strokeWidth={1.75} />
          </span>
        </div>
      )}
      <div>
        <p
          className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {prefix}
          {formatted}
          {suffix}
        </p>
        <p className="type-caption mt-1 text-[var(--color-text-muted)]">{label}</p>
      </div>
    </motion.div>
  )
}
