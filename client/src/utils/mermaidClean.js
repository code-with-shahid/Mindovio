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

/**
 * Detect diagram type from first meaningful line.
 * Returns canonical type string or null if unsupported.
 */
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
  // Normalize aliases
  if (/^stateDiagram$/i.test(type)) type = "stateDiagram-v2"
  if (/^graph$/i.test(type)) type = "graph"
  if (/^flowchart$/i.test(type)) type = "flowchart"

  const canonical = type === "stateDiagram-v2" ? "stateDiagram-v2" : type
  const allowed = ALLOWED_MERMAID_TYPES.some(
    (t) => t.toLowerCase() === canonical.toLowerCase()
  )
  return allowed ? canonical : null
}

function stripInvalidChars(text) {
  // Keep printable ASCII + common whitespace; drop control chars & zero-width junk
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
}

function trimLineSpaces(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "").replace(/^[ \t]+/, (m) => (m.length > 4 ? "    " : m)))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * Strip AI noise and return pure Mermaid source (or "").
 */
export function cleanMermaidSource(raw) {
  if (!raw || typeof raw !== "string") return ""

  // Normalize line endings + trim
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()

  // Extract fenced mermaid / generic code blocks
  const fenceMatch = text.match(/```(?:mermaid)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    text = fenceMatch[1].trim()
  } else {
    text = text
      .replace(/^```(?:mermaid)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim()
  }

  // Drop HTML
  text = text.replace(/<[^>]+>/g, "")

  // Remove invalid / control characters
  text = stripInvalidChars(text)

  // Drop obvious non-mermaid prose lines
  const lines = text.split("\n").filter((line) => {
    const t = line.trim()
    if (!t) return true
    if (/^#{1,6}\s/.test(t)) return false
    if (/^[-*•]\s/.test(t) && !t.includes("-->") && !t.includes("---") && !t.includes("->>")) {
      return false
    }
    if (
      /^\d+[.)]\s/.test(t) &&
      !TYPE_HEADER_RE.test(t) &&
      !/[A-Za-z0-9_]+\[/.test(t) &&
      !/-->|->>/.test(t)
    ) {
      return false
    }
    if (/^(here is|diagram:|note:|explanation:|the following|json|```)/i.test(t)) return false
    if (/^%%/.test(t)) return false // comments
    return true
  })

  text = lines.join("\n")
  text = text.replace(/`+/g, "")
  text = trimLineSpaces(text)

  if (!text) return ""

  // Upgrade legacy stateDiagram → stateDiagram-v2 (Mermaid 11)
  text = text.replace(/^stateDiagram\b(?!-)/im, "stateDiagram-v2")

  let type = detectMermaidType(text)

  // If no type header but looks like a flowchart body, wrap as flowchart TD
  if (!type) {
    const hasFlowBody = /-->/.test(text) || /\[[^\]]+\]/.test(text)
    if (!hasFlowBody) return ""
    text = `flowchart TD\n${text}`
    type = "flowchart"
  }

  // Reject unsupported types explicitly
  if (!type || !ALLOWED_MERMAID_TYPES.map((t) => t.toLowerCase()).includes(type.toLowerCase())) {
    return ""
  }

  // Body sanity: must have more than a header (except pie which can be short)
  const body = text.split("\n").slice(1).join("\n").trim()
  if (!body && !/^pie\b/i.test(text)) return ""

  // Quote flowchart/graph node labels only — other diagram types use different syntax
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

export function looksLikeMermaid(source) {
  if (!source) return false
  const type = detectMermaidType(source)
  if (!type) return false
  if (type === "pie") return true
  return (
    /-->|->>|--x|--\)|===|:::/.test(source) ||
    /\[[^\]]+\]/.test(source) ||
    /\bparticipant\b|\bactor\b|\bclass\b|\bstate\b|\bsection\b/i.test(source)
  )
}

/**
 * Lightweight sync structural check before mermaid.parse.
 * Returns { ok, type, reason }.
 */
export function validateMermaidStructure(source) {
  if (!source || typeof source !== "string") {
    return { ok: false, type: null, reason: "empty" }
  }
  const cleaned = source.trim()
  const type = detectMermaidType(cleaned)
  if (!type) {
    return { ok: false, type: null, reason: "unsupported_or_missing_type" }
  }
  if (!looksLikeMermaid(cleaned)) {
    return { ok: false, type, reason: "missing_diagram_body" }
  }
  return { ok: true, type, reason: null }
}
