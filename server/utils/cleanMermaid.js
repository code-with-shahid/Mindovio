/** Mermaid types we support (Mermaid v11). Everything else is rejected. */
export const ALLOWED_MERMAID_TYPES = [
  "flowchart",
  "graph",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram-v2",
  "erDiagram",
  "journey",
  "mindmap",
  "timeline",
  "pie",
  "gitGraph",
]

const TYPE_HEADER_RE =
  /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|mindmap|timeline|pie|gitGraph)\b/i

export function detectMermaidType(source) {
  if (!source) return null
  const first = source
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean)
  if (!first) return null

  const m = first.match(TYPE_HEADER_RE)
  if (!m) return null

  let type = m[1]
  if (/^stateDiagram$/i.test(type)) type = "stateDiagram-v2"

  const allowed = ALLOWED_MERMAID_TYPES.some(
    (t) => t.toLowerCase() === type.toLowerCase()
  )
  return allowed ? (/^stateDiagram-v2$/i.test(type) ? "stateDiagram-v2" : type) : null
}

function stripInvalidChars(text) {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
}

function trimLineSpaces(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * Server-side Mermaid string cleaner (mirrors client cleaner, no Mermaid parse).
 */
export function cleanMermaidSource(raw) {
  if (!raw || typeof raw !== "string") return ""

  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()

  const fenceMatch = text.match(/```(?:mermaid)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    text = fenceMatch[1].trim()
  } else {
    text = text
      .replace(/^```(?:mermaid)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim()
  }

  text = text.replace(/<[^>]+>/g, "")
  text = stripInvalidChars(text)

  const lines = text.split("\n").filter((line) => {
    const t = line.trim()
    if (!t) return true
    if (/^#{1,6}\s/.test(t)) return false
    if (/^[-*•]\s/.test(t) && !t.includes("-->") && !t.includes("---") && !t.includes("->>")) {
      return false
    }
    if (/^(here is|diagram:|note:|explanation:|the following|json|```)/i.test(t)) return false
    if (/^%%/.test(t)) return false
    return true
  })

  text = lines.join("\n").replace(/`+/g, "")
  text = trimLineSpaces(text)
  if (!text) return ""

  text = text.replace(/^stateDiagram\b(?!-)/im, "stateDiagram-v2")

  let type = detectMermaidType(text)

  if (!type) {
    const hasFlowBody = /-->/.test(text) || /\[[^\]]+\]/.test(text)
    if (!hasFlowBody) return ""
    text = `flowchart TD\n${text}`
    type = "flowchart"
  }

  if (!type || !ALLOWED_MERMAID_TYPES.map((t) => t.toLowerCase()).includes(type.toLowerCase())) {
    return ""
  }

  const body = text.split("\n").slice(1).join("\n").trim()
  if (!body && !/^pie\b/i.test(text)) return ""

  if (type === "flowchart" || type === "graph") {
    text = text.replace(/\[([^\]]*)\]/g, (_, label) => {
      const cleaned = String(label)
        .replace(/^["']+|["']+$/g, "")
        .replace(/"/g, "'")
        .replace(/[<>{}|;#]/g, "")
        .replace(/\n/g, " ")
        .trim()
      return `["${cleaned}"]`
    })
  }

  return trimLineSpaces(text)
}
