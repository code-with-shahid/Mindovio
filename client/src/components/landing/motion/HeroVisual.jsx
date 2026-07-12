import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useRef } from "react"
import { usePrefersReducedMotion } from "./usePrefersReducedMotion"
import { BRAND_NAME } from "../../../constants/brand"

export default function HeroVisual({ src, alt }) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 20 })
  const sy = useSpring(my, { stiffness: 80, damping: 20 })
  const rotateX = useTransform(sy, [-40, 40], [5, -5])
  const rotateY = useTransform(sx, [-40, 40], [-5, 5])

  const onMove = (e) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 80)
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 80)
  }

  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
    >
      {!reduced && <div className="hero-halo" aria-hidden />}
      <div
        className="absolute -inset-8 rounded-[2.5rem] bg-[#7C5CFF]/25 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -inset-3 rounded-[2rem] bg-[#4F8BFF]/18 blur-2xl pointer-events-none"
        aria-hidden
      />

      <div className="hero-gradient-border relative z-[1] rounded-[1.75rem] p-[1.5px] shadow-2xl shadow-[#7C5CFF]/25">
        <motion.div
          className="relative rounded-[1.65rem] overflow-hidden bg-[#0E1528]"
          animate={reduced ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={src}
            alt={alt || `${BRAND_NAME} preview`}
            className="w-full object-cover aspect-[4/3] object-center scale-[1.03]"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-transparent opacity-70"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#070B16]/50 to-transparent"
            aria-hidden
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
