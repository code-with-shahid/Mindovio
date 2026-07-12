/**
 * Build a Gemini prompt for an AI mock test grounded ONLY in the provided notes.
 */
export function buildMockTestPrompt({
  topic,
  classLevel,
  examType,
  difficulty,
  questionCount,
  notesContext,
}) {
  const mixGuide =
    difficulty === "mixed"
      ? `Mix difficulties: ~40% easy, ~40% medium, ~20% hard.`
      : `All questions should be ${difficulty} difficulty.`

  return `
You are an expert exam coach for Mindovio, an AI study platform.
Create a personalized mock test STRICTLY from the STUDY NOTES CONTEXT below.
Do NOT invent facts that are not supported by the notes.
Every question must be answerable from the notes.
Make questions UNIQUE (vary phrasing, scenarios, and angles) — never duplicate.

TOPIC: ${topic}
CLASS LEVEL: ${classLevel || "General"}
EXAM TYPE: ${examType || "General"}
DIFFICULTY MODE: ${difficulty}
NUMBER OF QUESTIONS: exactly ${questionCount}
${mixGuide}

STUDY NOTES CONTEXT (source of truth):
"""
${notesContext}
"""

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq" | "true_false" | "fill_blank" | "match" | "one_word" | "scenario" | "assertion_reason" | "diagram",
      "difficulty": "easy" | "medium" | "hard",
      "prompt": "question text",
      "options": ["A", "B", "C", "D"],
      "matchLeft": ["term1", "term2"],
      "matchRight": ["def1", "def2"],
      "correctAnswer": "exact correct value — for mcq use the option text; for true_false use \\"True\\" or \\"False\\"; for fill_blank/one_word use the expected string (lowercase ok); for match use object {\\"term1\\":\\"def1\\"}; for assertion_reason use \\"Both A and R true and R explains A\\" style short code or clear string",
      "explanation": {
        "correct": "the correct answer restated",
        "whyCorrect": "why it is correct",
        "whyWrong": ["why option X is wrong", "..."],
        "memoryTrick": "short mnemonic"
      },
      "topicTag": "specific sub-concept from notes",
      "diagramHint": "optional — only for diagram type, describe what to visualize"
    }
  ]
}

DISTRIBUTION (approximate, must sum to ${questionCount}):
- mcq: ~30%
- true_false: ~10%
- fill_blank: ~10%
- match: ~10% (2–4 pairs each)
- one_word: ~10%
- scenario: ~15%
- assertion_reason: ~10%
- diagram: ~5% (only if notes mention diagrams/flows; otherwise convert to scenario)

RULES:
- options required for mcq (exactly 4) and true_false (["True","False"])
- matchLeft/matchRight required for match (same length, 2–4 items); shuffle meaning so order of matchRight is NOT the answer key order — correctAnswer maps left→right
- fill_blank prompt should contain "____" where the blank is
- scenario and assertion_reason should be thoughtful, exam-style
- Keep language clear for students
- ids must be q1..q${questionCount}
`.trim()
}

export function buildFeedbackPrompt({ topic, score, weakTopics, answersSummary }) {
  return `
You are an encouraging exam mentor for Mindovio.
Analyze this mock test performance and return ONLY valid JSON (no markdown):

{
  "summary": "2-4 sentence personalized feedback",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "weakTopics": [
    { "topic": "...", "confidence": 0-100, "recommendation": "..." }
  ],
  "recommendations": {
    "sectionsToRevise": ["..."],
    "definitions": ["..."],
    "formulas": ["..."],
    "frequentMistakes": ["..."]
  },
  "studyPlan": [
    { "when": "Today", "task": "..." },
    { "when": "Tomorrow", "task": "..." },
    { "when": "This weekend", "task": "..." }
  ]
}

TOPIC: ${topic}
SCORE: ${score.correct}/${score.total} (${score.percentage}%), grade ${score.grade}
WEAK TOPIC TAGS FROM WRONG ANSWERS: ${JSON.stringify(weakTopics)}
ANSWER SNAPSHOT: ${JSON.stringify(answersSummary).slice(0, 4000)}
`.trim()
}

/**
 * Compact notes into a context string for the mock-test prompt.
 */
export function extractNotesContext(content, topic) {
  if (!content || typeof content !== "object") {
    return `Topic: ${topic}\n(No structured notes available)`
  }

  const parts = [`Topic: ${content.topic || topic}`]

  if (content.overview) parts.push(`Overview:\n${String(content.overview).slice(0, 1200)}`)
  if (Array.isArray(content.subTopics) && content.subTopics.length) {
    parts.push(`Sub-topics:\n${content.subTopics.slice(0, 20).join(", ")}`)
  }
  if (Array.isArray(content.revisionPoints) && content.revisionPoints.length) {
    parts.push(
      `Revision points:\n${content.revisionPoints
        .slice(0, 25)
        .map((p, i) => `${i + 1}. ${p}`)
        .join("\n")}`
    )
  }
  if (Array.isArray(content.keyDefinitions) && content.keyDefinitions.length) {
    parts.push(
      `Definitions:\n${content.keyDefinitions
        .slice(0, 15)
        .map((d) => (typeof d === "string" ? d : `${d.term}: ${d.definition}`))
        .join("\n")}`
    )
  }
  if (Array.isArray(content.formulas) && content.formulas.length) {
    parts.push(
      `Formulas:\n${content.formulas
        .slice(0, 12)
        .map((f) => (typeof f === "string" ? f : f.formula || f.expression || JSON.stringify(f)))
        .join("\n")}`
    )
  }
  if (Array.isArray(content.notes)) {
    const noteText = content.notes
      .slice(0, 8)
      .map((n) => {
        if (typeof n === "string") return n
        return `${n.heading || n.title || ""}: ${String(n.body || n.content || "").slice(0, 400)}`
      })
      .join("\n")
    if (noteText) parts.push(`Notes excerpts:\n${noteText.slice(0, 5000)}`)
  }
  if (content.questions?.mcqs?.length) {
    parts.push(
      `Existing MCQ themes (do NOT copy verbatim — invent new questions):\n${content.questions.mcqs
        .slice(0, 8)
        .map((q) => q.q || q.question)
        .join("\n")}`
    )
  }

  return parts.join("\n\n").slice(0, 14000)
}
