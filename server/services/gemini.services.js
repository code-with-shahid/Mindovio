import { normalizeStudyGuide } from "../utils/normalizeStudyGuide.js"

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-3-flash-preview"

const Gemini_URL = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

function extractJsonObject(text) {
  const clean = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()

  try {
    return JSON.parse(clean)
  } catch {
    /* continue */
  }

  const start = clean.indexOf("{")
  const end = clean.lastIndexOf("}")
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(clean.slice(start, end + 1))
    } catch {
      /* try repair */
    }
  }

  const arrStart = clean.indexOf("[")
  const arrEnd = clean.lastIndexOf("]")
  if (arrStart >= 0 && arrEnd > arrStart) {
    try {
      return { questions: JSON.parse(clean.slice(arrStart, arrEnd + 1)) }
    } catch {
      /* try repair */
    }
  }

  const qKey = clean.search(/"questions"\s*:\s*\[/)
  if (qKey >= 0) {
    const listStart = clean.indexOf("[", qKey)
    if (listStart >= 0) {
      const repaired = repairJsonArray(clean.slice(listStart))
      if (repaired?.length) return { questions: repaired }
    }
  }

  throw new Error("Could not parse Gemini JSON")
}

function repairJsonArray(arraySlice) {
  const items = []
  let depth = 0
  let inString = false
  let escape = false
  let objStart = -1

  for (let i = 0; i < arraySlice.length; i++) {
    const ch = arraySlice[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === "\\") escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === "{") {
      if (depth === 0) objStart = i
      depth += 1
    } else if (ch === "}") {
      depth -= 1
      if (depth === 0 && objStart >= 0) {
        const chunk = arraySlice.slice(objStart, i + 1)
        try {
          items.push(JSON.parse(chunk))
        } catch {
          /* skip */
        }
        objStart = -1
      }
    }
  }
  return items
}

function getResponseText(data) {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ""
  return parts.map((p) => p?.text || "").join("").trim()
}

async function callGemini(prompt, { generationConfig, model } = {}) {
  const modelName = model || DEFAULT_MODEL
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing")
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  }
  if (generationConfig) body.generationConfig = generationConfig

  const response = await fetch(
    `${Gemini_URL(modelName)}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )

  const raw = await response.text()
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(`Gemini returned non-JSON (${response.status}): ${raw.slice(0, 200)}`)
  }

  if (!response.ok) {
    const msg = data?.error?.message || raw.slice(0, 300)
    const err = new Error(msg)
    err.status = response.status
    throw err
  }

  const finish = data.candidates?.[0]?.finishReason
  const text = getResponseText(data)
  if (!text) {
    throw new Error(
      `No text returned from Gemini${finish ? ` (finishReason=${finish})` : ""}`
    )
  }

  return extractJsonObject(text)
}

/** Study-guide notes — lean tokens + JSON mime for faster generation. */
export const generateGeminiResponse = async (prompt) => {
  try {
    const parsed = await callGemini(prompt, {
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.45,
        maxOutputTokens: 4600,
      },
    })
    return normalizeStudyGuide(parsed)
  } catch (error) {
    // One fast fallback without mime if JSON mode fails
    try {
      console.warn("Notes JSON mime failed, retrying plain:", error.message)
      const parsed = await callGemini(prompt, {
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 4600,
        },
      })
      return normalizeStudyGuide(parsed)
    } catch (err2) {
      console.error("Gemini Fetch Error:", err2.message)
      throw new Error("Gemini API fetch failed")
    }
  }
}

/** Mock tests / feedback — compact token budgets. */
export const generateGeminiJSON = async (prompt, options = {}) => {
  const maxOutputTokens = options.maxOutputTokens || 3072
  const temperature = options.temperature ?? 0.55

  try {
    return await callGemini(prompt, {
      generationConfig: {
        responseMimeType: "application/json",
        temperature,
        maxOutputTokens,
      },
    })
  } catch (error) {
    console.error("Gemini JSON attempt failed:", error.message)
    if (error.status === 429) {
      throw new Error("Gemini rate limit reached. Please wait a minute and try again.")
    }

    // Retry once without mime only for parse/empty issues
    if (/parse|JSON|No text/i.test(error.message || "")) {
      try {
        return await callGemini(prompt, {
          generationConfig: { temperature, maxOutputTokens },
        })
      } catch (err2) {
        console.error("Gemini JSON fallback failed:", err2.message)
      }
    }

    const message = error?.message || "Gemini API fetch failed"
    throw new Error(
      /quota|rate|429/i.test(message)
        ? "Gemini rate limit reached. Please wait a minute and try again."
        : /parse|JSON/i.test(message)
          ? "AI returned incomplete questions. Try fewer questions (10) and retry."
          : "Gemini API fetch failed"
    )
  }
}
