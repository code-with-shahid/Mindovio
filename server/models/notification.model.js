import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "promo", "system"],
      default: "info",
    },
    published: { type: Boolean, default: true },
    audience: {
      type: String,
      enum: ["all", "dashboard"],
      default: "dashboard",
    },
    link: { type: String, default: "" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
)

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
