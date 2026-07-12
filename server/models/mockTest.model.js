import mongoose from "mongoose"

const questionSchema = new mongoose.Schema(
  {
    id: String,
    type: {
      type: String,
      enum: [
        "mcq",
        "true_false",
        "fill_blank",
        "match",
        "one_word",
        "scenario",
        "assertion_reason",
        "diagram",
      ],
    },
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    prompt: String,
    options: [String],
    matchLeft: [String],
    matchRight: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    explanation: {
      correct: String,
      whyCorrect: String,
      whyWrong: [String],
      memoryTrick: String,
    },
    topicTag: String,
    diagramHint: String,
  },
  { _id: false }
)

const mockTestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notes",
      required: true,
    },
    topic: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },
    questionCount: { type: Number, required: true },
    questions: [questionSchema],
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    flagged: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["ready", "in_progress", "submitted"],
      default: "ready",
    },
    startedAt: Date,
    submittedAt: Date,
    timeLimitSec: { type: Number, default: 0 },
    timeTakenSec: { type: Number, default: 0 },
    score: {
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      grade: String,
      accuracy: { type: Number, default: 0 },
      xpEarned: { type: Number, default: 0 },
    },
    results: { type: mongoose.Schema.Types.Mixed },
    feedback: { type: mongoose.Schema.Types.Mixed },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
)

const MockTest = mongoose.model("MockTest", mockTestSchema)
export default MockTest
