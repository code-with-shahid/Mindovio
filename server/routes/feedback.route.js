import express from "express"
import rateLimit from "express-rate-limit"
import Feedback from "../models/feedback.model.js"

const feedbackRouter = express.Router()

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages. Please try again later." },
})

/** Public — contact / feedback intake for admin inbox */
feedbackRouter.post("/", submitLimiter, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim()
    const email = String(req.body?.email || "").trim()
    const subject = String(req.body?.subject || "General").trim()
    const message = String(req.body?.message || "").trim()

    if (!message) {
      return res.status(400).json({ message: "Message is required" })
    }
    if (message.length > 5000) {
      return res.status(400).json({ message: "Message is too long" })
    }

    const item = await Feedback.create({
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      subject: subject.slice(0, 120),
      message,
      source: "contact",
      status: "new",
    })

    return res.status(201).json({
      id: item._id,
      message: "Feedback received",
    })
  } catch (error) {
    console.error("submitFeedback:", error)
    return res.status(500).json({ message: "Failed to submit feedback" })
  }
})

export default feedbackRouter
