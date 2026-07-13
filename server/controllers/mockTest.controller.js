import MockTest from "../models/mockTest.model.js"
import Notes from "../models/notes.model.js"
import UserModel from "../models/user.model.js"
import { generateGeminiJSON } from "../services/gemini.services.js"
import {
  buildMockTestPrompt,
  buildFeedbackPrompt,
  extractNotesContext,
  buildFallbackQuestions,
} from "../utils/mockTestPrompt.js"

const CREDIT_COST = 5
const ALLOWED_COUNTS = [10, 20, 30, 50]
const ALLOWED_DIFFICULTY = ["easy", "medium", "hard", "mixed"]
const ALLOWED_Q_TYPES = [
  "mcq",
  "true_false",
  "fill_blank",
  "match",
  "one_word",
  "scenario",
  "assertion_reason",
  "diagram",
]
const ALLOWED_Q_DIFFICULTY = ["easy", "medium", "hard"]

function gradeFromPercentage(p) {
  if (p >= 90) return "A+"
  if (p >= 80) return "A"
  if (p >= 70) return "B"
  if (p >= 60) return "C"
  if (p >= 50) return "D"
  return "F"
}

function normalizeAnswer(value) {
  if (value == null) return ""
  if (typeof value === "object") return JSON.stringify(value)
  return String(value).trim().toLowerCase()
}

function answersMatch(correct, given, type) {
  if (given == null || given === "") return false
  if (type === "match") {
    try {
      const c = typeof correct === "object" ? correct : JSON.parse(correct)
      const g = typeof given === "object" ? given : JSON.parse(given)
      const keys = Object.keys(c || {})
      if (!keys.length) return false
      return keys.every((k) => normalizeAnswer(c[k]) === normalizeAnswer(g?.[k]))
    } catch {
      return normalizeAnswer(correct) === normalizeAnswer(given)
    }
  }
  return normalizeAnswer(correct) === normalizeAnswer(given)
}

function normalizeQuestionType(raw) {
  const t = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
  const aliases = {
    multiple_choice: "mcq",
    "multiple_choice_question": "mcq",
    mcq: "mcq",
    truefalse: "true_false",
    true_false: "true_false",
    "t/f": "true_false",
    fill_in_the_blank: "fill_blank",
    fill_in_blanks: "fill_blank",
    fill_blanks: "fill_blank",
    fill_blank: "fill_blank",
    matching: "match",
    match_the_following: "match",
    match: "match",
    one_word: "one_word",
    oneword: "one_word",
    short_answer: "one_word",
    scenario: "scenario",
    scenario_based: "scenario",
    assertion_reason: "assertion_reason",
    assertion_and_reason: "assertion_reason",
    diagram: "diagram",
    diagram_based: "diagram",
  }
  const mapped = aliases[t] || t
  return ALLOWED_Q_TYPES.includes(mapped) ? mapped : "mcq"
}

function normalizeCorrectAnswer(value, type) {
  if (type === "match") {
    if (value && typeof value === "object" && !Array.isArray(value)) return value
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed === "object") return parsed
      } catch {
        /* ignore */
      }
    }
    return {}
  }
  if (value == null) return ""
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function sanitizeQuestions(rawList, count) {
  const list = Array.isArray(rawList) ? rawList : []
  return list
    .slice(0, count)
    .map((q, i) => {
      const type = normalizeQuestionType(q?.type)
      const difficulty = ALLOWED_Q_DIFFICULTY.includes(q?.difficulty)
        ? q.difficulty
        : "medium"
      const prompt = String(
        q?.prompt || q?.question || q?.q || q?.text || q?.stem || ""
      ).trim()
      let options = Array.isArray(q?.options) ? q.options.map(String) : []
      if (type === "true_false" && options.length < 2) {
        options = ["True", "False"]
      }
      if (type === "mcq" && options.length >= 2 && options.length < 4) {
        while (options.length < 4) options.push(`Option ${options.length + 1}`)
      }
      return {
        id: String(q?.id || `q${i + 1}`),
        type,
        difficulty,
        prompt,
        options,
        matchLeft: Array.isArray(q?.matchLeft) ? q.matchLeft.map(String) : [],
        matchRight: Array.isArray(q?.matchRight) ? q.matchRight.map(String) : [],
        correctAnswer: normalizeCorrectAnswer(q?.correctAnswer ?? q?.answer ?? "", type),
        explanation: {
          correct:
            q?.explanation?.correct ||
            (typeof q?.correctAnswer === "object"
              ? JSON.stringify(q.correctAnswer)
              : String(q?.correctAnswer || "")),
          whyCorrect:
            typeof q?.explanation?.whyCorrect === "string"
              ? q.explanation.whyCorrect
              : typeof q?.explanation === "string"
                ? q.explanation
                : "",
          whyWrong: Array.isArray(q?.explanation?.whyWrong)
            ? q.explanation.whyWrong.map(String)
            : [],
          memoryTrick: q?.explanation?.memoryTrick
            ? String(q.explanation.memoryTrick)
            : "",
        },
        topicTag: String(q?.topicTag || "General"),
        diagramHint: q?.diagramHint ? String(q.diagramHint) : "",
      }
    })
    .filter((q) => q.prompt.length > 0)
}

function toPlainQuestion(q) {
  if (!q) return {}
  if (typeof q.toObject === "function") return q.toObject()
  if (typeof q.toJSON === "function") return q.toJSON()
  return { ...q }
}

function computeBadges({ percentage, timeTakenSec, questionCount, correct }) {
  const badges = []
  if (percentage === 100) badges.push("Perfect Score")
  if (timeTakenSec > 0 && timeTakenSec < questionCount * 25) badges.push("Fast Learner")
  if (percentage >= 80) badges.push("Concept Master")
  if (correct >= Math.ceil(questionCount * 0.6)) badges.push("Critical Thinker")
  if (percentage >= 50) badges.push("Consistency")
  return badges
}

function buildInstantFeedback({ topic, percentage, grade, correct, weakMap }) {
  const weakTopics = Object.keys(weakMap || {})
  return {
    summary: `You scored ${percentage}% (${grade}) on ${topic}. ${
      weakTopics.length
        ? `Focus next on: ${weakTopics.slice(0, 3).join(", ")}.`
        : "Solid attempt — keep revising with another mock test."
    } Personalized AI insights are refining in the background.`,
    strengths:
      correct > 0
        ? ["You answered several questions correctly — keep reinforcing those topics."]
        : ["You started the assessment — review explanations and retry for gains."],
    weaknesses: weakTopics.length
      ? weakTopics.map((t) => `Needs work: ${t}`)
      : ["Complete more questions to unlock deeper insights."],
    weakTopics: Object.entries(weakMap || {}).map(([t, n]) => ({
      topic: t,
      confidence: Math.max(20, 100 - n * 20),
      recommendation: `Revise “${t}” from your Mindovio notes and retry related questions.`,
    })),
    recommendations: {
      sectionsToRevise: weakTopics,
      definitions: [],
      formulas: [],
      frequentMistakes: weakTopics,
    },
    studyPlan: [
      { when: "Today", task: `Revise weak topics: ${weakTopics.join(", ") || topic}` },
      { when: "Tomorrow", task: "Solve 15 practice MCQs from your notes" },
      { when: "This weekend", task: "Attempt another Mindovio mock test at a higher difficulty" },
    ],
  }
}

/** Enrich feedback with Gemini after submit (non-blocking). */
async function enrichFeedbackAsync(testId, payload) {
  try {
    const ai = await generateGeminiJSON(buildFeedbackPrompt(payload), {
      maxOutputTokens: 1000,
      temperature: 0.35,
    })
    if (!ai || typeof ai !== "object") {
      await MockTest.findByIdAndUpdate(testId, { feedbackStatus: "failed" })
      return
    }
    await MockTest.findByIdAndUpdate(testId, {
      feedback: ai,
      feedbackStatus: "ready",
    })
  } catch (err) {
    console.warn("Background feedback failed:", err.message)
    await MockTest.findByIdAndUpdate(testId, { feedbackStatus: "failed" }).catch(() => {})
  }
}

function publicQuestions(questions) {
  return (questions || []).map((q) => {
    const plain = toPlainQuestion(q)
    return {
      id: plain.id,
      type: plain.type || "mcq",
      difficulty: plain.difficulty || "medium",
      prompt: plain.prompt || "",
      options: Array.isArray(plain.options) ? plain.options : [],
      matchLeft: Array.isArray(plain.matchLeft) ? plain.matchLeft : [],
      matchRight: Array.isArray(plain.matchRight) ? plain.matchRight : [],
      topicTag: plain.topicTag || "General",
      diagramHint: plain.diagramHint || "",
    }
  })
}

/** POST /api/mock-tests/generate */
export const generateMockTest = async (req, res) => {
  try {
    const { noteId, difficulty = "mixed", questionCount = 10 } = req.body
    const count = Number(questionCount)

    if (!noteId) return res.status(400).json({ message: "noteId is required" })
    if (!ALLOWED_DIFFICULTY.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty" })
    }
    if (!ALLOWED_COUNTS.includes(count)) {
      return res.status(400).json({ message: "Invalid question count" })
    }

    const user = await UserModel.findById(req.userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    if (user.credits < CREDIT_COST) {
      user.isCreditAvailable = false
      await user.save()
      return res.status(403).json({ message: "Insufficient credits" })
    }

    const note = await Notes.findOne({ _id: noteId, user: user._id })
    if (!note) return res.status(404).json({ message: "Notes not found" })

    const notesContext = extractNotesContext(note.content, note.topic)
    const prompt = buildMockTestPrompt({
      topic: note.topic,
      classLevel: note.classLevel,
      examType: note.examType,
      difficulty,
      questionCount: count,
      notesContext,
    })

    let questions = []
    let usedFallback = false

    try {
      const ai = await generateGeminiJSON(prompt, {
        maxOutputTokens: Math.min(8192, Math.max(2400, count * 280)),
        temperature: 0.4,
      })
      const rawQuestions = Array.isArray(ai?.questions)
        ? ai.questions
        : Array.isArray(ai)
          ? ai
          : []
      questions = sanitizeQuestions(rawQuestions, count)
    } catch (aiErr) {
      console.error("Mock test AI failed, using fallback:", aiErr.message)
      usedFallback = true
    }

    if (questions.length < count) {
      const filler = buildFallbackQuestions({
        topic: note.topic,
        notesContext,
        count: count - questions.length,
        difficulty,
      })
      const start = questions.length
      questions = [
        ...questions,
        ...sanitizeQuestions(
          filler.map((q, i) => ({ ...q, id: `q${start + i + 1}` })),
          filler.length
        ),
      ]
      if (filler.length) usedFallback = true
    }

    if (questions.length < Math.min(3, count)) {
      questions = sanitizeQuestions(
        buildFallbackQuestions({
          topic: note.topic,
          notesContext,
          count,
          difficulty,
        }),
        count
      )
      usedFallback = true
    }

    // Ensure stable ids q1..qn
    questions = questions.slice(0, count).map((q, i) => ({ ...q, id: `q${i + 1}` }))

    const timeLimitSec = questions.length * 90

    let mock
    try {
      mock = await MockTest.create({
        user: user._id,
        note: note._id,
        topic: note.topic,
        difficulty,
        questionCount: questions.length,
        questions,
        status: "ready",
        timeLimitSec,
      })
    } catch (dbErr) {
      console.error("MockTest.create validation:", dbErr)
      return res.status(502).json({
        message: "Generated questions could not be saved. Please try again.",
      })
    }

    user.credits -= CREDIT_COST
    if (user.credits <= 0) user.isCreditAvailable = false
    await user.save()

    return res.status(200).json({
      testId: mock._id,
      noteId: note._id,
      topic: mock.topic,
      difficulty: mock.difficulty,
      questionCount: mock.questionCount,
      timeLimitSec: mock.timeLimitSec,
      questions: publicQuestions(mock.questions),
      creditsLeft: user.credits,
      creditCost: CREDIT_COST,
      usedFallback,
    })
  } catch (error) {
    console.error("generateMockTest:", error)
    const msg = String(error?.message || "")
    if (/rate limit|quota|429/i.test(msg)) {
      return res.status(429).json({ message: msg })
    }
    return res.status(500).json({
      message: "Failed to generate mock test. Please try again.",
    })
  }
}

/** POST /api/mock-tests/:id/start */
export const startMockTest = async (req, res) => {
  try {
    const mock = await MockTest.findOne({ _id: req.params.id, user: req.userId })
    if (!mock) return res.status(404).json({ message: "Test not found" })
    if (mock.status === "submitted") {
      return res.status(400).json({ message: "Test already submitted" })
    }
    if (!mock.startedAt) {
      mock.startedAt = new Date()
      mock.status = "in_progress"
      await mock.save()
    }
    return res.json({
      testId: mock._id,
      startedAt: mock.startedAt,
      timeLimitSec: mock.timeLimitSec,
      status: mock.status,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Failed to start test" })
  }
}

/** GET /api/mock-tests/:id */
export const getMockTest = async (req, res) => {
  try {
    const mock = await MockTest.findOne({ _id: req.params.id, user: req.userId })
    if (!mock) return res.status(404).json({ message: "Test not found" })

    if (mock.status === "submitted") {
      return res.json({
        testId: mock._id,
        noteId: mock.note,
        topic: mock.topic,
        difficulty: mock.difficulty,
        questionCount: mock.questionCount,
        status: mock.status,
        score: mock.score,
        results: mock.results,
        feedback: mock.feedback,
        feedbackStatus: mock.feedbackStatus || "ready",
        badges: mock.badges,
        timeTakenSec: mock.timeTakenSec,
        timeLimitSec: mock.timeLimitSec,
        submittedAt: mock.submittedAt,
        questions: mock.questions,
        answers: mock.answers,
      })
    }

    return res.json({
      testId: mock._id,
      noteId: mock.note,
      topic: mock.topic,
      difficulty: mock.difficulty,
      questionCount: mock.questionCount,
      status: mock.status,
      timeLimitSec: mock.timeLimitSec,
      startedAt: mock.startedAt,
      questions: publicQuestions(mock.questions),
      answers: mock.answers || {},
      flagged: mock.flagged || [],
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Failed to load test" })
  }
}

/** POST /api/mock-tests/:id/submit */
export const submitMockTest = async (req, res) => {
  try {
    const { answers = {}, flagged = [], timeTakenSec } = req.body
    const mock = await MockTest.findOne({ _id: req.params.id, user: req.userId })
    if (!mock) return res.status(404).json({ message: "Test not found" })
    if (mock.status === "submitted") {
      return res.status(400).json({ message: "Already submitted" })
    }

    const perQuestion = []
    let correct = 0
    let wrong = 0
    let skipped = 0
    const weakMap = {}

    for (const q of mock.questions) {
      const given = answers[q.id]
      const empty =
        given == null ||
        given === "" ||
        (typeof given === "object" && !Object.keys(given).length)

      if (empty) {
        skipped += 1
        perQuestion.push({
          id: q.id,
          status: "skipped",
          given: null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topicTag: q.topicTag,
          type: q.type,
          prompt: q.prompt,
        })
        continue
      }

      const ok = answersMatch(q.correctAnswer, given, q.type)
      if (ok) {
        correct += 1
        perQuestion.push({
          id: q.id,
          status: "correct",
          given,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topicTag: q.topicTag,
          type: q.type,
          prompt: q.prompt,
        })
      } else {
        wrong += 1
        weakMap[q.topicTag || "General"] = (weakMap[q.topicTag || "General"] || 0) + 1
        perQuestion.push({
          id: q.id,
          status: "wrong",
          given,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topicTag: q.topicTag,
          type: q.type,
          prompt: q.prompt,
        })
      }
    }

    const total = mock.questions.length
    const attempted = correct + wrong
    const percentage = total ? Math.round((correct / total) * 100) : 0
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0
    const grade = gradeFromPercentage(percentage)
    const taken =
      typeof timeTakenSec === "number"
        ? timeTakenSec
        : mock.startedAt
          ? Math.round((Date.now() - new Date(mock.startedAt).getTime()) / 1000)
          : 0

    const score = {
      correct,
      wrong,
      skipped,
      total,
      percentage,
      grade,
      accuracy,
      xpEarned: correct * 10 + (percentage >= 80 ? 50 : 0),
    }

    const typeBreakdown = {}
    for (const row of perQuestion) {
      if (!typeBreakdown[row.type]) typeBreakdown[row.type] = { correct: 0, total: 0 }
      typeBreakdown[row.type].total += 1
      if (row.status === "correct") typeBreakdown[row.type].correct += 1
    }

    const topicBreakdown = {}
    for (const row of perQuestion) {
      const t = row.topicTag || "General"
      if (!topicBreakdown[t]) topicBreakdown[t] = { correct: 0, total: 0 }
      topicBreakdown[t].total += 1
      if (row.status === "correct") topicBreakdown[t].correct += 1
    }

    const radar = Object.entries(topicBreakdown).map(([topic, v]) => ({
      topic,
      score: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))

    const badges = computeBadges({
      percentage,
      timeTakenSec: taken,
      questionCount: total,
      correct,
    })

    // Instant provisional feedback — Gemini enrichment runs after response
    const feedback = buildInstantFeedback({
      topic: mock.topic,
      percentage,
      grade,
      correct,
      weakMap,
    })

    mock.answers = answers
    mock.flagged = flagged
    mock.status = "submitted"
    mock.submittedAt = new Date()
    mock.timeTakenSec = taken
    mock.score = score
    mock.results = { perQuestion, typeBreakdown, topicBreakdown, radar }
    mock.feedback = feedback
    mock.feedbackStatus = "pending"
    mock.badges = badges
    await mock.save()

    // Do not block the client on Gemini
    setImmediate(() => {
      enrichFeedbackAsync(mock._id, {
        topic: mock.topic,
        score,
        weakTopics: Object.keys(weakMap),
        answersSummary: perQuestion.map((p) => ({
          id: p.id,
          status: p.status,
          topicTag: p.topicTag,
          type: p.type,
        })),
      })
    })

    return res.json({
      testId: mock._id,
      noteId: mock.note,
      score,
      results: mock.results,
      feedback,
      feedbackStatus: "pending",
      badges,
      timeTakenSec: taken,
      topic: mock.topic,
      difficulty: mock.difficulty,
      questionCount: mock.questionCount,
    })
  } catch (error) {
    console.error("submitMockTest:", error)
    return res.status(500).json({ message: "Failed to submit test" })
  }
}

/** GET /api/mock-tests */
export const listMockTests = async (req, res) => {
  try {
    const tests = await MockTest.find({ user: req.userId, status: "submitted" })
      .select("topic difficulty questionCount score timeTakenSec createdAt submittedAt badges")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    return res.json(tests)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Failed to load mock test history" })
  }
}
