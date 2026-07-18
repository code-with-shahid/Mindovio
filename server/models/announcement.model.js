import mongoose from "mongoose"

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "maintenance", "release", "feature", "warning"],
      default: "info",
    },
    published: { type: Boolean, default: true },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
)

const Announcement = mongoose.model("Announcement", announcementSchema)
export default Announcement
