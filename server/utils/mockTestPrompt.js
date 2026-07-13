/**
 * Build a Gemini prompt for a fast, note-grounded mock test.
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
      ? "Mix: mostly medium, some easy/hard."
      : `All questions: ${difficulty}.`

  return `
You are a fast exam coach for Mindovio.
Create ${questionCount} UNIQUE questions ONLY from the notes context.
Return ONLY valid JSON. Keep every field SHORT.

TOPIC: ${topic}
LEVEL: ${classLevel || "General"} | EXAM: ${examType || "General"}
DIFFICULTY: ${difficulty} (${mixGuide})

NOTES CONTEXT:
"""
${notesContext}
"""

JSON shape:
{"questions":[{"id":"q1","type":"mcq","difficulty":"easy","prompt":"...","options":["A","B","C","D"],"matchLeft":[],"matchRight":[],"correctAnswer":"A","explanation":{"correct":"...","whyCorrect":"1 sentence","whyWrong":[],"memoryTrick":""},"topicTag":"...","diagramHint":""}]}

TYPE MIX (approx):
- 50% mcq (4 options)
- 15% true_false (options ["True","False"])
- 15% fill_blank (prompt has ____)
- 10% one_word
- 10% scenario OR assertion_reason
Skip match/diagram unless clearly useful.

RULES:
- ids q1..q${questionCount}
- Prefer type "mcq" or "true_false" for reliability (at least 70% mcq)
- For mcq: options exactly 4 strings; correctAnswer MUST equal one option text exactly
- For true_false: options ["True","False"]; correctAnswer "True" or "False"
- whyCorrect max 10 words; whyWrong []; memoryTrick ""
- Output the COMPLETE questions array — never truncate mid-object
`.trim()
}

export function buildFeedbackPrompt({ topic, score, weakTopics, answersSummary }) {
  return `
Return ONLY compact JSON feedback for Mindovio mock test:

{
  "summary": "2 sentences",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "weakTopics": [{ "topic": "...", "confidence": 0-100, "recommendation": "..." }],
  "recommendations": {
    "sectionsToRevise": ["..."],
    "definitions": [],
    "formulas": [],
    "frequentMistakes": ["..."]
  },
  "studyPlan": [
    { "when": "Today", "task": "..." },
    { "when": "Tomorrow", "task": "..." },
    { "when": "Weekend", "task": "..." }
  ]
}

TOPIC: ${topic}
SCORE: ${score.correct}/${score.total} (${score.percentage}%) grade ${score.grade}
WEAK: ${JSON.stringify(weakTopics)}
SNAPSHOT: ${JSON.stringify(answersSummary).slice(0, 1800)}
`.trim()
}

function flattenSubTopics(subTopics) {
  if (!subTopics) return []
  if (Array.isArray(subTopics)) return subTopics.map(String).filter(Boolean)
  if (typeof subTopics === "object") {
    return Object.values(subTopics).flat().map(String).filter(Boolean)
  }
  return []
}

/** Compact notes context — keep small so mock tests generate quickly. */
export function extractNotesContext(content, topic) {
  if (!content || typeof content !== "object") {
    return `Topic: ${topic}\n(No structured notes available)`
  }

  const parts = [`Topic: ${content.title || content.topic || topic}`]

  if (content.overview) parts.push(`Overview:\n${String(content.overview).slice(0, 700)}`)
  if (content.summary) parts.push(`Summary:\n${String(content.summary).slice(0, 500)}`)

  const subs = flattenSubTopics(content.subTopics)
  if (subs.length) parts.push(`Sub-topics:\n${subs.slice(0, 18).join(", ")}`)

  if (Array.isArray(content.coreConcepts) && content.coreConcepts.length) {
    parts.push(
      `Concepts:\n${content.coreConcepts
        .slice(0, 6)
        .map((c) => {
          if (typeof c === "string") return c
          return `${c.title || ""}: ${String(c.explanation || c.body || "").slice(0, 180)}`
        })
        .join("\n")}`
    )
  }

  if (typeof content.notes === "string" && content.notes.trim()) {
    parts.push(`Notes:\n${content.notes.slice(0, 2200)}`)
  }

  const defs = content.definitions || content.keyDefinitions
  if (Array.isArray(defs) && defs.length) {
    parts.push(
      `Definitions:\n${defs
        .slice(0, 8)
        .map((d) =>
          typeof d === "string" ? d : `${d.term || ""}: ${String(d.definition || "").slice(0, 120)}`
        )
        .join("\n")}`
    )
  }

  const revision = [
    ...(Array.isArray(content.revisionPoints) ? content.revisionPoints : []),
    ...(Array.isArray(content.importantPoints) ? content.importantPoints : []),
    ...(Array.isArray(content.keyTakeaways) ? content.keyTakeaways : []),
  ]
  if (revision.length) {
    parts.push(
      `Revision:\n${revision
        .slice(0, 12)
        .map((p, i) => `${i + 1}. ${typeof p === "string" ? p : p.text || ""}`)
        .join("\n")}`
    )
  }

  return parts.join("\n\n").slice(0, 5500)
}

/**
 * Local backup questions when Gemini fails or returns too few.
 * Built from notes context so the user can still take a test.
 */
export function buildFallbackQuestions({ topic, notesContext, count, difficulty }) {
  const text = String(notesContext || "")
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/^[\d.\-*•]+\s*/, "").trim())
    .filter((l) => l.length > 24 && l.length < 180 && !/^topic:/i.test(l))

  const unique = [...new Set(lines)].slice(0, Math.max(count * 2, 12))
  const pool = unique.length
    ? unique
    : [
        `${topic} is an important exam topic with core definitions and processes.`,
        `Students should revise key terms and algorithms related to ${topic}.`,
        `Exam questions on ${topic} often test concepts, comparisons, and applications.`,
        `Understanding fundamentals of ${topic} helps solve both short and long answers.`,
        `Revision of ${topic} should include definitions, examples, and common mistakes.`,
        `Practice questions on ${topic} improve recall under timed conditions.`,
        `Diagrams and steps are useful when explaining ${topic} in exams.`,
        `Priority concepts in ${topic} should be memorized with short mnemonics.`,
        `Application-based questions on ${topic} check deeper understanding.`,
        `A clear summary of ${topic} helps last-minute revision.`,
      ]

  const diffCycle =
    difficulty === "mixed"
      ? ["easy", "medium", "hard"]
      : [ALLOWED_OR_DEFAULT(difficulty)]

  const questions = []
  for (let i = 0; i < count; i++) {
    const fact = pool[i % pool.length]
    const d = diffCycle[i % diffCycle.length]
    const mode = i % 3

    if (mode === 0) {
      const wrong = pool[(i + 1) % pool.length]
      questions.push({
        id: `q${i + 1}`,
        type: "mcq",
        difficulty: d,
        prompt: `Which statement best matches the notes on “${topic}”?`,
        options: [fact.slice(0, 110), wrong.slice(0, 110), `Unrelated: ${topic} is not in syllabus`, "None of the above"],
        matchLeft: [],
        matchRight: [],
        correctAnswer: fact.slice(0, 110),
        explanation: {
          correct: fact.slice(0, 110),
          whyCorrect: "Taken from your generated notes.",
          whyWrong: ["Does not match the notes excerpt."],
          memoryTrick: "",
        },
        topicTag: topic || "General",
        diagramHint: "",
      })
    } else if (mode === 1) {
      questions.push({
        id: `q${i + 1}`,
        type: "true_false",
        difficulty: d,
        prompt: `True or False: ${fact.slice(0, 140)}`,
        options: ["True", "False"],
        matchLeft: [],
        matchRight: [],
        correctAnswer: "True",
        explanation: {
          correct: "True",
          whyCorrect: "This statement appears in your notes.",
          whyWrong: [],
          memoryTrick: "",
        },
        topicTag: topic || "General",
        diagramHint: "",
      })
    } else {
      const word =
        fact
          .split(/\s+/)
          .find((w) => w.length > 5 && !/^(which|about|students|should|related)$/i.test(w)) || topic || "concept"
      const blanked = fact.replace(word, "____").slice(0, 140)
      questions.push({
        id: `q${i + 1}`,
        type: "fill_blank",
        difficulty: d,
        prompt: blanked.includes("____") ? blanked : `Fill in: ____ is central to ${topic}.`,
        options: [],
        matchLeft: [],
        matchRight: [],
        correctAnswer: blanked.includes("____") ? word.replace(/[^\w-]/g, "") : String(topic || "concept"),
        explanation: {
          correct: blanked.includes("____") ? word : String(topic || "concept"),
          whyCorrect: "Keyword from your notes.",
          whyWrong: [],
          memoryTrick: "",
        },
        topicTag: topic || "General",
        diagramHint: "",
      })
    }
  }
  return questions
}

function ALLOWED_OR_DEFAULT(d) {
  return ["easy", "medium", "hard"].includes(d) ? d : "medium"
}
