import { useEffect, useRef, useState } from "react"

/**
 * Lightweight premium pen cursor for fine-pointer desktops.
 * CSS url() cursors fail in Chrome for SVG — this DOM cursor is reliable.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const cursorRef = useRef(null)
  const rafRef = useRef(0)
  const posRef = useRef({ x: -100, y: -100 })
  const modeRef = useRef("default")

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    const sync = () => setEnabled(fine.matches)
    sync()
    fine.addEventListener("change", sync)
    return () => fine.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const root = document.documentElement
    root.classList.add("pen-cursor-on")
    const elCursor = cursorRef.current

    const paint = () => {
      rafRef.current = 0
      if (!elCursor) return
      const { x, y } = posRef.current
      const mode = modeRef.current
      const hide = mode === "text" || mode === "hidden"
      const rotate = mode === "glow" ? -8 : mode === "link" ? -4 : 0
      const scale = mode === "link" ? 1.12 : mode === "glow" ? 1.06 : 1
      elCursor.style.opacity = hide ? "0" : "1"
      elCursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-20%, -85%) rotate(${rotate}deg) scale(${scale})`
      elCursor.dataset.mode = mode
      elCursor.classList.toggle("is-glow", mode === "glow" || mode === "link")
    }

    const schedule = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(paint)
    }

    const resolveMode = (el) => {
      if (!el) return "default"
      if (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable ||
        el.closest("input, textarea, select, [contenteditable='true'], .ui-input")
      ) {
        return "text"
      }
      if (el.closest('[aria-disabled="true"], :disabled, .cursor-not-allowed')) {
        return "hidden"
      }
      if (el.closest("a[href], .nav-link-premium")) return "link"
      if (
        el.closest(
          'button, [role="button"], [type="button"], [type="submit"], summary, label[for], .cursor-pointer, .premium-btn-primary'
        )
      ) {
        return "glow"
      }
      if (
        el.closest(
          "p, li, blockquote, article, h1, h2, h3, h4, h5, h6, .prose-study, .type-display, .type-h1, .type-h2, .type-h3, .type-body, .type-body-lg, .type-sm"
        )
      ) {
        return "write"
      }
      return "default"
    }

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      const under = document.elementFromPoint(e.clientX, e.clientY)
      modeRef.current = resolveMode(under)
      schedule()
    }

    const onLeave = () => {
      if (elCursor) elCursor.style.opacity = "0"
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    schedule()

    return () => {
      root.classList.remove("pen-cursor-on")
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={cursorRef} className="pen-cursor" data-mode="default" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-32 10 10)">
          <path
            className="pen-barrel"
            d="M9.15 2.1 L10.85 2.1 C11.15 2.1 11.35 2.35 11.32 2.65 L10.85 12.35 L9.15 12.35 L8.68 2.65 C8.65 2.35 8.85 2.1 9.15 2.1 Z"
            fill="#E8ECF4"
          />
          <rect className="pen-band" x="8.7" y="4.35" width="2.6" height="0.7" rx="0.2" fill="#7C5CFF" />
          <path
            d="M9.05 12.35 L10.95 12.35 L11.35 14.1 C11.4 14.35 11.2 14.55 10.95 14.55 L9.05 14.55 C8.8 14.55 8.6 14.35 8.65 14.1 Z"
            fill="#4A5568"
          />
          <path
            d="M9.15 14.55 L10.85 14.55 L10.15 17.55 C10.08 17.85 9.72 17.85 9.65 17.55 Z"
            fill="#1A1F2E"
          />
          <circle className="pen-tip" cx="10" cy="16.85" r="0.45" fill="#7C5CFF" />
          <path
            className="pen-ink"
            d="M10 17.35 C10.8 17.7 11.4 18.1 11.6 18.5"
            stroke="#7C5CFF"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0"
          />
        </g>
      </svg>
    </div>
  )
}
