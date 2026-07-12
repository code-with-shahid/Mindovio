import MockTest from "../models/mockTest.model.js"
import Notes from "../models/notes.model.js"
import UserModel from "../models/user.model.js"
import { generateGeminiJSON } from "../services/gemini.services.js"
import {
  buildMockTestPrompt,
  buildFeedbackPrompt,
  extractNotesContext,
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

function sanitizeQuestions(rawList, count) {
  const list = Array.isArray(rawList) ? rawList : []
  return list
    .slice(0, count)
    .map((q, i) => {
      const type = normalizeQuestionType(q?.type)
      const difficulty = ALLOWED_Q_DIFFICULTY.includes(q?.difficulty)
        ? q.difficulty
        : "medium"
      const prompt = String(q?.prompt || q?.question || "").trim()
      let options = Array.isArray(q?.options) ? q.options.map(String) : []
      if (type === "true_false" && options.length < 2) {
        options = ["True", "False"]
      }
      return {
        id: String(q?.id || `q${i + 1}`),
        type,
        difficulty,
        prompt,
        options,
        matchLeft: Array.isArray(q?.matchLeft) ? q.matchLeft.map(String) : [],
        matchRight: Array.isArray(q?.matchRight) ? q.matchRight.map(String) : [],
        correctAnswer: q?.correctAnswer ?? q?.answer ?? "",
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

    const ai = await generateGeminiJSON(prompt)
    const rawQuestions = Array.isArray(ai?.questions)
      ? ai.questions
      : Array.isArray(ai)
        ? ai
        : []
    const questions = sanitizeQuestions(rawQuestions, count)
    if (questions.length < Math.min(5, count)) {
      return res.status(502).json({
        message: "AI returned too few questions. Please try again.",
      })
    }

    const timeLimitSec = questions.length * 90

    const mock = await MockTest.create({
      user: user._id,
      note: note._id,
      topic: note.topic,
      difficulty,
      questionCount: questions.length,
      questions,
      status: "ready",
      timeLimitSec,
    })

    user.credits -= CREDIT_COST
    if (user.credits <= 0) user.isCreditAvailable = false
    await user.save()

    return res.status(200).json({
      testId: mock._id,
      topic: mock.topic,
      difficulty: mock.difficulty,
      questionCount: mock.questionCount,
      timeLimitSec: mock.timeLimitSec,
      questions: publicQuestions(mock.questions),
      creditsLeft: user.credits,
      creditCost: CREDIT_COST,
    })
  } catch (error) {
    console.error("generateMockTest:", error)
    return res.status(500).json({
      message: error?.message?.includes("Gemini")
        ? "AI failed to generate questions. Please try again."
        : "Failed to generate mock test",
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

    let feedback = null
    try {
      feedback = await generateGeminiJSON(
        buildFeedbackPrompt({
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
      )
    } catch (err) {
      console.warn("Feedback generation failed, using fallback", err.message)
      feedback = {
        summary: `You scored ${percentage}% (${grade}) on ${mock.topic}. Focus on revising missed concepts and retry a new set.`,
        strengths: correct > 0 ? ["You answered several questions correctly — keep reinforcing those topics."] : [],
        weaknesses: Object.keys(weakMap).length
          ? Object.keys(weakMap).map((t) => `Needs work: ${t}`)
          : ["Complete more questions to unlock deeper insights."],
        weakTopics: Object.entries(weakMap).map(([topic, n]) => ({
          topic,
          confidence: Math.max(20, 100 - n * 20),
          recommendation: `Revise “${topic}” from your Mindovio notes and retry related questions.`,
        })),
        recommendations: {
          sectionsToRevise: Object.keys(weakMap),
          definitions: [],
          formulas: [],
          frequentMistakes: Object.keys(weakMap),
        },
        studyPlan: [
          { when: "Today", task: `Revise weak topics: ${Object.keys(weakMap).join(", ") || mock.topic}` },
          { when: "Tomorrow", task: "Solve 15 practice MCQs from your notes" },
          { when: "This weekend", task: "Attempt another Mindovio mock test at a higher difficulty" },
        ],
      }
    }

    const badges = computeBadges({
      percentage,
      timeTakenSec: taken,
      questionCount: total,
      correct,
    })

    mock.answers = answers
    mock.flagged = flagged
    mock.status = "submitted"
    mock.submittedAt = new Date()
    mock.timeTakenSec = taken
    mock.score = score
    mock.results = { perQuestion, typeBreakdown, topicBreakdown, radar }
    mock.feedback = feedback
    mock.badges = badges
    await mock.save()

    return res.json({
      testId: mock._id,
      noteId: mock.note,
      score,
      results: mock.results,
      feedback,
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
