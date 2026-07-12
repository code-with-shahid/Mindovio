import { Component, useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { HiOutlineSquare3Stack3D } from "react-icons/hi2"
import { useTheme } from "../context/ThemeContext"
import {
  cleanMermaidSource,
  validateMermaidStructure,
} from "../utils/mermaidClean"

export function DiagramFallback({ message = "Diagram could not be generated." }) {
  return (
    <div
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-10 flex flex-col items-center justify-center text-center gap-3"
      role="status"
    >
      <div className="h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
        <HiOutlineSquare3Stack3D className="text-2xl text-brand-600 dark:text-brand-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{message}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs">
          The diagram syntax was invalid or incomplete. The rest of your study guide is still available.
        </p>
      </div>
    </div>
  )
}

/** Catch React render errors so Mermaid never crashes the page */
class MermaidErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error("[Mermaid] React error boundary caught:", error)
  }

  render() {
    if (this.state.hasError) return <DiagramFallback />
    return this.props.children
  }
}

function MermaidRenderer({ diagram }) {
  const containerRef = useRef(null)
  const { theme } = useTheme()
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dark" ? "dark" : "default",
        securityLevel: "loose",
        flowchart: { htmlLabels: false, curve: "basis" },
      })
    } catch (err) {
      console.error("[Mermaid] initialize failed:", err)
    }
  }, [theme])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setFailed(false)
      setReady(false)

      try {
        const cleaned = cleanMermaidSource(diagram)

        console.log("[Mermaid] raw input:", diagram)
        console.log("[Mermaid] cleaned string:", cleaned)

        const structural = validateMermaidStructure(cleaned)
        if (!structural.ok) {
          console.warn("[Mermaid] structural validation failed:", structural.reason, cleaned)
          if (!cancelled) setFailed(true)
          return
        }

        console.log("[Mermaid] detected type:", structural.type)

        // Mermaid v11 parse validator
        try {
          await mermaid.parse(cleaned)
        } catch (parseErr) {
          console.error("[Mermaid] parse validation failed:", parseErr?.message || parseErr)
          console.error("[Mermaid] rejected source:\n", cleaned)
          if (!cancelled) setFailed(true)
          return
        }

        if (cancelled || !containerRef.current) return

        containerRef.current.innerHTML = ""
        const uniqueId = `mermaid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

        try {
          const { svg } = await mermaid.render(uniqueId, cleaned)
          if (cancelled || !containerRef.current) return
          containerRef.current.innerHTML = svg
          setReady(true)
        } catch (renderErr) {
          console.error("[Mermaid] render failed:", renderErr?.message || renderErr)
          console.error("[Mermaid] failed source:\n", cleaned)
          if (!cancelled) {
            setFailed(true)
            setReady(false)
            if (containerRef.current) containerRef.current.innerHTML = ""
          }
        }
      } catch (err) {
        console.error("[Mermaid] unexpected pipeline error:", err)
        if (!cancelled) setFailed(true)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [diagram, theme])

  if (!diagram || failed) {
    return <DiagramFallback />
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 sm:p-4 overflow-x-auto scroll-x min-h-[120px]">
      {!ready && (
        <p className="text-xs text-[var(--color-text-muted)] animate-pulse py-6 text-center">
          Rendering diagram…
        </p>
      )}
      <div
        ref={containerRef}
        className={
          ready
            ? "flex justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:max-h-[min(70vh,28rem)]"
            : "hidden"
        }
      />
    </div>
  )
}

export default function MermaidSetup({ diagram }) {
  return (
    <MermaidErrorBoundary>
      <MermaidRenderer diagram={diagram} />
    </MermaidErrorBoundary>
  )
}
