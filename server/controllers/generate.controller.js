import Notes from "../models/notes.model.js"
import UserModel from "../models/user.model.js"
import { generateGeminiResponse } from "../services/gemini.services.js"
import { buildPrompt } from "../utils/promptBuilder.js"

export const NOTES_CREDIT_COST = 10

export const generateNotes = async (req, res) => {
  try {
    const {
      topic,
      classLevel,
      examType,
      revisionMode = false,
      includeDiagram = false,
      includeChart = false,
    } = req.body

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" })
    }

    const user = await UserModel.findById(req.userId)
    if (!user) {
      return res.status(400).json({ message: "user is not found" })
    }

    if (user.credits < NOTES_CREDIT_COST) {
      user.isCreditAvailable = false
      await user.save()
      return res.status(403).json({
        message: "Insufficient credits",
      })
    }

    const prompt = buildPrompt({
      topic,
      classLevel,
      examType,
      revisionMode,
      includeDiagram,
      includeChart,
    })

    const aiResponse = await generateGeminiResponse(prompt)

    const notes = await Notes.create({
      user: user._id,
      topic,
      classLevel,
      examType,
      revisionMode,
      includeDiagram,
      includeChart,
      content: aiResponse,
    })

    // Atomic deduct — always exactly 10 credits per successful generation
    const updated = await UserModel.findOneAndUpdate(
      { _id: user._id, credits: { $gte: NOTES_CREDIT_COST } },
      {
        $inc: { credits: -NOTES_CREDIT_COST },
        $push: { notes: notes._id },
      },
      { new: true }
    )

    if (!updated) {
      // Notes were created but credits changed mid-request — still return content
      // and mark credits unavailable if needed
      await UserModel.findByIdAndUpdate(user._id, {
        $push: { notes: notes._id },
        $set: { isCreditAvailable: false },
      })
      return res.status(403).json({
        message: "Insufficient credits",
      })
    }

    if (updated.credits <= 0) {
      updated.isCreditAvailable = false
      await updated.save()
    }

    return res.status(200).json({
      data: aiResponse,
      noteId: notes._id,
      creditsLeft: updated.credits,
      creditCost: NOTES_CREDIT_COST,
    })
  } catch (error) {
    console.error(error)
    res.status(error.status || 500).json({
      error: "AI generation failed",
      message: error.message,
    })
  }
}
