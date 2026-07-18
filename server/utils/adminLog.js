import AdminLog from "../models/adminLog.model.js"

export async function writeAdminLog({
  action,
  actorEmail,
  targetType = "",
  targetId = "",
  meta = {},
  req,
}) {
  try {
    const ip =
      req?.headers?.["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() ||
      req?.ip ||
      ""
    await AdminLog.create({
      action,
      actorEmail: actorEmail || "unknown",
      targetType,
      targetId: targetId ? String(targetId) : "",
      meta,
      ip,
    })
  } catch (err) {
    console.error("AdminLog write failed:", err.message)
  }
}
