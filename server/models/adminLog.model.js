import mongoose from "mongoose"

const adminLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actorEmail: { type: String, required: true },
    targetType: { type: String, default: "" },
    targetId: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
)

adminLogSchema.index({ createdAt: -1 })
adminLogSchema.index({ action: 1 })

const AdminLog = mongoose.model("AdminLog", adminLogSchema)
export default AdminLog
