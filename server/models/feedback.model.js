import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    subject: { type: String, default: "General" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    reply: { type: String, default: "" },
    source: { type: String, default: "contact" },
  },
  { timestamps: true }
)

const Feedback = mongoose.model("Feedback", feedbackSchema)
export default Feedback
