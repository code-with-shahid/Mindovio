import { normalizeStudyGuide } from "../utils/normalizeStudyGuide.js"

/**
 * Model chain for production resilience.
 * Google retires / overloads models often — never ship a single hard-coded model.
 *
 * Env (any one works):
 *   GEMINI_MODELS=gemini-3.5-flash,gemini-2.0-flash,gemini-flash-latest
 *   GEMINI_MODEL=... + GEMINI_FALLBACK_MODEL=...
 */
function resolveModelChain() {
  const fromList = (process.env.GEMINI_MODELS || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)

  const primary = process.env.GEMINI_MODEL || "gemini-2.0-flash"
  const fallback = process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-latest"
  const tertiary = process.env.GEMINI_FALLBACK_MODEL_2 || "gemini-2.0-flash-lite"
  const quaternary = process.env.GEMINI_FALLBACK_MODEL_3 || "gemini-1.5-flash"

  const chain = fromList.length
    ? fromList
    : [primary, fallback, tertiary, quaternary]
  return [...new Set(chain)]
}

const MODEL_CHAIN = resolveModelChain()
const DEFAULT_MODEL = MODEL_CHAIN[0]

const isTransientModelError = (err) =>
  err?.status === 503 ||
  err?.status === 429 ||
  /high demand|overloaded|try again later|resource.?exhausted|quota|rate limit/i.test(
    err?.message || ""
  )

const isUnavailableModel = (err) =>
  err?.status === 404 ||
  /no longer available|not found|is not found|unsupported|invalid model/i.test(
    err?.message || ""
  )

const shouldSkipModel = (err) => isTransientModelError(err) || isUnavailableModel(err)

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

/** Study-guide notes — walk the model chain until one succeeds. */
export const generateGeminiResponse = async (prompt) => {
  const config = { temperature: 0.45, maxOutputTokens: 4600 }
  const plans = []
  for (const model of MODEL_CHAIN) {
    plans.push({
      model,
      generationConfig: { ...config, responseMimeType: "application/json" },
    })
    plans.push({ model, generationConfig: { ...config } })
  }

  let lastError = null
  const skipModels = new Set()
  for (const plan of plans) {
    if (skipModels.has(plan.model)) continue
    try {
      const parsed = await callGemini(prompt, plan)
      return normalizeStudyGuide(parsed)
    } catch (error) {
      lastError = error
      console.warn(`Notes attempt failed (${plan.model}):`, error.message)
      if (shouldSkipModel(error)) skipModels.add(plan.model)
    }
  }

  console.error("Gemini Fetch Error:", lastError?.message)
  const transient = isTransientModelError(lastError)
  const err = new Error(
    transient
      ? "The AI model is experiencing high demand right now. Please try again in a minute."
      : isUnavailableModel(lastError)
        ? "Configured Gemini models are unavailable. Update GEMINI_MODELS on the server."
        : "Gemini API fetch failed"
  )
  err.status = transient ? 503 : 500
  throw err
}

/** Mock tests / feedback — same model chain, smaller token budget. */
export const generateGeminiJSON = async (prompt, options = {}) => {
  const maxOutputTokens = options.maxOutputTokens || 3072
  const temperature = options.temperature ?? 0.55
  const config = { temperature, maxOutputTokens }

  let lastError = null
  const skipModels = new Set()

  for (const model of MODEL_CHAIN) {
    if (skipModels.has(model)) continue
    try {
      return await callGemini(prompt, {
        model,
        generationConfig: { ...config, responseMimeType: "application/json" },
      })
    } catch (error) {
      lastError = error
      console.warn(`Gemini JSON attempt failed (${model}):`, error.message)
      if (shouldSkipModel(error)) {
        skipModels.add(model)
        continue
      }
      // Parse/empty issues — retry same model without JSON mime once
      if (/parse|JSON|No text/i.test(error.message || "")) {
        try {
          return await callGemini(prompt, {
            model,
            generationConfig: config,
          })
        } catch (err2) {
          lastError = err2
          console.warn(`Gemini JSON plain retry failed (${model}):`, err2.message)
          if (shouldSkipModel(err2)) skipModels.add(model)
        }
      }
    }
  }

  const message = lastError?.message || "Gemini API fetch failed"
  throw new Error(
    /quota|rate|429/i.test(message)
      ? "Gemini rate limit reached. Please wait a minute and try again."
      : /parse|JSON/i.test(message)
        ? "AI returned incomplete questions. Try fewer questions (10) and retry."
        : "Gemini API fetch failed"
  )
}
