import { useEffect, useRef } from "react"
import mermaid from "mermaid"
import { useTheme } from "../context/ThemeContext"

const cleanMermaidChart = (diagram) => {
  if (!diagram) return ""
  let clean = diagram.replace(/\r\n/g, "\n").trim()
  if (!clean.startsWith("graph")) clean = `graph TD\n${clean}`
  return clean
}

const autoFixNodes = (diagram) => {
  let index = 0
  const used = new Map()
  return diagram.replace(/\[(.*?)\]/g, (match, label) => {
    const key = label.trim()
    if (used.has(key)) return used.get(key)
    index++
    const id = `N${index}`
    const node = `${id}["${key}"]`
    used.set(key, node)
    return node
  })
}

export default function MermaidSetup({ diagram }) {
  const containerRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    })
  }, [theme])

  useEffect(() => {
    if (!diagram || !containerRef.current) return

    const renderDiagram = async () => {
      try {
        containerRef.current.innerHTML = ""
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`
        const safeChart = autoFixNodes(cleanMermaidChart(diagram))
        const { svg } = await mermaid.render(uniqueId, safeChart)
        containerRef.current.innerHTML = svg
      } catch (error) {
        console.error("Mermaid render failed:", error)
        containerRef.current.innerHTML = `<p class="text-sm text-[var(--color-text-muted)]">Diagram could not be rendered.</p>`
      }
    }

    renderDiagram()
  }, [diagram, theme])

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 overflow-x-auto">
      <div ref={containerRef} />
    </div>
  )
}
