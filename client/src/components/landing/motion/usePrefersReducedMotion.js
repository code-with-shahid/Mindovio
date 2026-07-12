import { useEffect, useState } from "react"

/** Respect OS reduced-motion preference for premium animations. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return reduced
}

export const viewportOnce = { once: true, amount: 0.2, margin: "0px 0px -5% 0px" }
