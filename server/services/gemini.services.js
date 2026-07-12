import { normalizeStudyGuide } from "../utils/normalizeStudyGuide.js"

const Gemini_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"

function extractJsonObject(text) {
  const clean = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()
  try {
    return JSON.parse(clean)
  } catch {
    const start = clean.indexOf("{")
    const end = clean.lastIndexOf("}")
    if (start >= 0 && end > start) {
      return JSON.parse(clean.slice(start, end + 1))
    }
    const arrStart = clean.indexOf("[")
    const arrEnd = clean.lastIndexOf("]")
    if (arrStart >= 0 && arrEnd > arrStart) {
      return { questions: JSON.parse(clean.slice(arrStart, arrEnd + 1)) }
    }
    throw new Error("Could not parse Gemini JSON")
  }
}

async function callGemini(prompt, generationConfig) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  }
  if (generationConfig) body.generationConfig = generationConfig

  const response = await fetch(`${Gemini_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("No text returned from Gemini")

  return extractJsonObject(text)
}

export const generateGeminiResponse = async (prompt) => {
  try {
    const parsed = await callGemini(prompt)
    return normalizeStudyGuide(parsed)
  } catch (error) {
    console.error("Gemini Fetch Error:", error.message)
    throw new Error("Gemini API fetch failed")
  }
}

/** Raw JSON from Gemini — for mock tests / feedback (no study-guide normalizer). */
export const generateGeminiJSON = async (prompt) => {
  try {
    return await callGemini(prompt, {
      responseMimeType: "application/json",
      temperature: 0.9,
    })
  } catch (error) {
    console.error("Gemini JSON Error:", error.message)
    throw new Error("Gemini API fetch failed")
  }
}
