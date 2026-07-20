import express from "express"
import rateLimit from "express-rate-limit"
import isAdminAuth from "../middleware/isAdminAuth.js"
import {
  adminLogin,
  tryAdminLogin,
  adminLogout,
  adminMe,
} from "../controllers/admin.auth.controller.js"
import {
  getStats,
  getAnalytics,
  listUsers,
  getUser,
  updateUserStatus,
  updateUserCredits,
  deleteUser,
  resetUserPasswordStub,
  listNotes,
  deleteNote,
  listMockTests,
  getPaymentsOverview,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  listFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  listNotificationsAdmin,
  createNotification,
  updateNotification,
  deleteNotification,
  getSubscriptions,
  listLogs,
  globalSearch,
  exportReport,
  getSettings,
} from "../controllers/admin.controller.js"

const adminRouter = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
})

const tryLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
})

adminRouter.post("/login", loginLimiter, adminLogin)
adminRouter.post("/try-login", tryLoginLimiter, tryAdminLogin)

adminRouter.use(isAdminAuth)

adminRouter.post("/logout", adminLogout)
adminRouter.get("/me", adminMe)
adminRouter.get("/stats", getStats)
adminRouter.get("/analytics", getAnalytics)
adminRouter.get("/search", globalSearch)
adminRouter.get("/settings", getSettings)

adminRouter.get("/users", listUsers)
adminRouter.get("/users/:id", getUser)
adminRouter.patch("/users/:id/status", updateUserStatus)
adminRouter.patch("/users/:id/credits", updateUserCredits)
adminRouter.delete("/users/:id", deleteUser)
adminRouter.post("/users/:id/reset-password", resetUserPasswordStub)

adminRouter.get("/notes", listNotes)
adminRouter.delete("/notes/:id", deleteNote)

adminRouter.get("/mock-tests", listMockTests)
adminRouter.get("/payments", getPaymentsOverview)

adminRouter.get("/announcements", listAnnouncements)
adminRouter.post("/announcements", createAnnouncement)
adminRouter.delete("/announcements/:id", deleteAnnouncement)

adminRouter.get("/feedback", listFeedback)
adminRouter.post("/feedback", createFeedback)
adminRouter.patch("/feedback/:id", updateFeedback)
adminRouter.delete("/feedback/:id", deleteFeedback)

adminRouter.get("/notifications", listNotificationsAdmin)
adminRouter.post("/notifications", createNotification)
adminRouter.patch("/notifications/:id", updateNotification)
adminRouter.delete("/notifications/:id", deleteNotification)

adminRouter.get("/subscriptions", getSubscriptions)

adminRouter.get("/logs", listLogs)
adminRouter.get("/reports/export", exportReport)

export default adminRouter
