import UserModel from "../models/user.model.js"
import Notes from "../models/notes.model.js"
import MockTest from "../models/mockTest.model.js"
import Announcement from "../models/announcement.model.js"
import Feedback from "../models/feedback.model.js"
import Notification from "../models/notification.model.js"
import AdminLog from "../models/adminLog.model.js"
import { writeAdminLog } from "../utils/adminLog.js"

const CREDIT_PLANS = [
  { amountInr: 100, credits: 50, label: "Starter" },
  { amountInr: 200, credits: 120, label: "Plus" },
  { amountInr: 500, credits: 300, label: "Pro" },
]

const PREMIUM_CREDITS_THRESHOLD = 100

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function bucketByDay(docs, dateField, days) {
  const map = {}
  for (let i = days - 1; i >= 0; i--) {
    const key = daysAgo(i).toISOString().slice(0, 10)
    map[key] = 0
  }
  for (const doc of docs) {
    const raw = doc[dateField] || doc.createdAt
    if (!raw) continue
    const key = new Date(raw).toISOString().slice(0, 10)
    if (key in map) map[key] += 1
  }
  return Object.entries(map).map(([date, count]) => ({ date, count }))
}

/** GET /api/admin/stats */
export const getStats = async (req, res) => {
  try {
    const today = startOfToday()
    const [
      totalUsers,
      todayUsers,
      activeUsers,
      premiumUsers,
      freeUsers,
      bannedUsers,
      generatedNotes,
      mockTests,
      submittedMocks,
      avgCredits,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ createdAt: { $gte: today } }),
      UserModel.countDocuments({ updatedAt: { $gte: daysAgo(7) } }),
      UserModel.countDocuments({ credits: { $gt: PREMIUM_CREDITS_THRESHOLD } }),
      UserModel.countDocuments({ credits: { $lte: PREMIUM_CREDITS_THRESHOLD } }),
      UserModel.countDocuments({ status: "banned" }),
      Notes.countDocuments(),
      MockTest.countDocuments(),
      MockTest.countDocuments({ status: "submitted" }),
      UserModel.aggregate([{ $group: { _id: null, avg: { $avg: "$credits" } } }]),
    ])

    const totalCredits = await UserModel.aggregate([
      { $group: { _id: null, sum: { $sum: "$credits" } } },
    ])

    return res.json({
      totalUsers,
      activeUsers,
      todayUsers,
      premiumUsers,
      freeUsers,
      bannedUsers,
      generatedNotes,
      generatedMockTests: mockTests,
      submittedMockTests: submittedMocks,
      aiRequests: generatedNotes + mockTests,
      estimatedRevenueNote:
        "Full revenue ledger lives in Stripe Dashboard — no local payment collection yet.",
      avgCredits: Math.round(avgCredits[0]?.avg || 0),
      totalCreditsHeld: totalCredits[0]?.sum || 0,
      storageUsed: "N/A",
      serverStatus: "ok",
      apiStatus: "ok",
    })
  } catch (error) {
    console.error("getStats:", error)
    return res.status(500).json({ message: "Failed to load stats" })
  }
}

/** GET /api/admin/analytics */
export const getAnalytics = async (req, res) => {
  try {
    const since30 = daysAgo(30)
    const [users, notes, mocks, submitted] = await Promise.all([
      UserModel.find({ createdAt: { $gte: since30 } }).select("createdAt").lean(),
      Notes.find({ createdAt: { $gte: since30 } }).select("createdAt topic").lean(),
      MockTest.find({ createdAt: { $gte: since30 } }).select("createdAt").lean(),
      MockTest.find({ status: "submitted", submittedAt: { $gte: since30 } })
        .select("score topic timeTakenSec submittedAt")
        .lean(),
    ])

    const topicCounts = {}
    for (const n of notes) {
      const t = n.topic || "Unknown"
      topicCounts[t] = (topicCounts[t] || 0) + 1
    }
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }))

    const subjectCounts = {}
    let scoreSum = 0
    let scoreN = 0
    let timeSum = 0
    let timeN = 0
    for (const m of submitted) {
      const t = m.topic || "Unknown"
      subjectCounts[t] = (subjectCounts[t] || 0) + 1
      if (typeof m.score?.percentage === "number") {
        scoreSum += m.score.percentage
        scoreN += 1
      }
      if (typeof m.timeTakenSec === "number") {
        timeSum += m.timeTakenSec
        timeN += 1
      }
    }
    const popularSubjects = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }))

    return res.json({
      dailyUsers: bucketByDay(users, "createdAt", 14),
      weeklyUsers: bucketByDay(users, "createdAt", 7),
      monthlyUsers: bucketByDay(users, "createdAt", 30),
      notesOverTime: bucketByDay(notes, "createdAt", 14),
      mockAttempts: bucketByDay(mocks, "createdAt", 14),
      topTopics,
      popularSubjects,
      averageScore: scoreN ? Math.round(scoreSum / scoreN) : 0,
      averageCompletionSec: timeN ? Math.round(timeSum / timeN) : 0,
      successRate: scoreN
        ? Math.round(
            (submitted.filter((m) => (m.score?.percentage || 0) >= 50).length / scoreN) *
              100
          )
        : 0,
      aiUsage: bucketByDay([...notes, ...mocks], "createdAt", 14),
    })
  } catch (error) {
    console.error("getAnalytics:", error)
    return res.status(500).json({ message: "Failed to load analytics" })
  }
}

/** GET /api/admin/users */
export const listUsers = async (req, res) => {
  try {
    const {
      q = "",
      status,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query

    const filter = {}
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ]
    }
    if (status && ["active", "banned", "deactivated"].includes(status)) {
      filter.status = status
    }

    const pageNum = Math.max(1, Number(page) || 1)
    const lim = Math.min(100, Math.max(1, Number(limit) || 20))
    const sortKey = ["createdAt", "name", "email", "credits", "updatedAt"].includes(sort)
      ? sort
      : "createdAt"
    const sortDir = order === "asc" ? 1 : -1

    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .select("-__v")
        .sort({ [sortKey]: sortDir })
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .lean(),
      UserModel.countDocuments(filter),
    ])

    return res.json({ items, total, page: pageNum, limit: lim })
  } catch (error) {
    console.error("listUsers:", error)
    return res.status(500).json({ message: "Failed to list users" })
  }
}

/** GET /api/admin/users/:id */
export const getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).lean()
    if (!user) return res.status(404).json({ message: "User not found" })
    const [notesCount, mocksCount] = await Promise.all([
      Notes.countDocuments({ user: user._id }),
      MockTest.countDocuments({ user: user._id }),
    ])
    return res.json({ ...user, notesCount, mocksCount })
  } catch (error) {
    console.error("getUser:", error)
    return res.status(500).json({ message: "Failed to load user" })
  }
}

/** PATCH /api/admin/users/:id/status */
export const updateUserStatus = async (req, res) => {
  try {
    const { status, banReason } = req.body
    if (!["active", "banned", "deactivated"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }
    const update = { status }
    if (status === "banned") {
      update.bannedAt = new Date()
      update.banReason = banReason || "Banned by admin"
    } else {
      update.bannedAt = null
      update.banReason = ""
    }
    const user = await UserModel.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).lean()
    if (!user) return res.status(404).json({ message: "User not found" })

    await writeAdminLog({
      action: `user_${status}`,
      actorEmail: req.adminEmail,
      targetType: "user",
      targetId: user._id,
      meta: { banReason: update.banReason },
      req,
    })

    return res.json(user)
  } catch (error) {
    console.error("updateUserStatus:", error)
    return res.status(500).json({ message: "Failed to update user" })
  }
}

/** PATCH /api/admin/users/:id/credits */
export const updateUserCredits = async (req, res) => {
  try {
    const credits = Number(req.body?.credits)
    if (!Number.isFinite(credits) || credits < 0) {
      return res.status(400).json({ message: "Invalid credits value" })
    }
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        credits: Math.floor(credits),
        isCreditAvailable: credits > 0,
      },
      { new: true }
    ).lean()
    if (!user) return res.status(404).json({ message: "User not found" })

    await writeAdminLog({
      action: "user_credits_update",
      actorEmail: req.adminEmail,
      targetType: "user",
      targetId: user._id,
      meta: { credits: user.credits },
      req,
    })

    return res.json(user)
  } catch (error) {
    console.error("updateUserCredits:", error)
    return res.status(500).json({ message: "Failed to update credits" })
  }
}

/** DELETE /api/admin/users/:id */
export const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    await writeAdminLog({
      action: "user_delete",
      actorEmail: req.adminEmail,
      targetType: "user",
      targetId: user._id,
      meta: { email: user.email },
      req,
    })

    return res.json({ message: "User deleted", id: user._id })
  } catch (error) {
    console.error("deleteUser:", error)
    return res.status(500).json({ message: "Failed to delete user" })
  }
}

/** POST /api/admin/users/:id/reset-password — stub (Firebase-owned) */
export const resetUserPasswordStub = async (req, res) => {
  await writeAdminLog({
    action: "user_reset_password_stub",
    actorEmail: req.adminEmail,
    targetType: "user",
    targetId: req.params.id,
    req,
  })
  return res.status(501).json({
    message:
      "Password reset is managed by Firebase Authentication. Use the Firebase console for this user.",
  })
}

/** GET /api/admin/notes */
export const listNotes = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query
    const filter = {}
    if (q) {
      filter.$or = [
        { topic: { $regex: q, $options: "i" } },
        { examType: { $regex: q, $options: "i" } },
        { classLevel: { $regex: q, $options: "i" } },
      ]
    }
    const pageNum = Math.max(1, Number(page) || 1)
    const lim = Math.min(100, Math.max(1, Number(limit) || 20))

    const [items, total] = await Promise.all([
      Notes.find(filter)
        .select("topic classLevel examType revisionMode includeDiagram includeChart user createdAt updatedAt")
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .lean(),
      Notes.countDocuments(filter),
    ])

    return res.json({ items, total, page: pageNum, limit: lim })
  } catch (error) {
    console.error("listNotes:", error)
    return res.status(500).json({ message: "Failed to list notes" })
  }
}

/** DELETE /api/admin/notes/:id */
export const deleteNote = async (req, res) => {
  try {
    const note = await Notes.findByIdAndDelete(req.params.id)
    if (!note) return res.status(404).json({ message: "Note not found" })

    await UserModel.findByIdAndUpdate(note.user, { $pull: { notes: note._id } })
    await writeAdminLog({
      action: "note_delete",
      actorEmail: req.adminEmail,
      targetType: "note",
      targetId: note._id,
      meta: { topic: note.topic },
      req,
    })

    return res.json({ message: "Note deleted", id: note._id })
  } catch (error) {
    console.error("deleteNote:", error)
    return res.status(500).json({ message: "Failed to delete note" })
  }
}

/** GET /api/admin/mock-tests */
export const listMockTests = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20, status } = req.query
    const filter = {}
    if (q) filter.topic = { $regex: q, $options: "i" }
    if (status) filter.status = status

    const pageNum = Math.max(1, Number(page) || 1)
    const lim = Math.min(100, Math.max(1, Number(limit) || 20))

    const [items, total, aggregates] = await Promise.all([
      MockTest.find(filter)
        .select(
          "topic difficulty questionCount status score timeTakenSec startedAt submittedAt createdAt user"
        )
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .lean(),
      MockTest.countDocuments(filter),
      MockTest.aggregate([
        { $match: { status: "submitted" } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: "$score.percentage" },
            avgTime: { $avg: "$timeTakenSec" },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    return res.json({
      items,
      total,
      page: pageNum,
      limit: lim,
      averageScore: Math.round(aggregates[0]?.avgScore || 0),
      averageCompletionSec: Math.round(aggregates[0]?.avgTime || 0),
      submittedCount: aggregates[0]?.count || 0,
    })
  } catch (error) {
    console.error("listMockTests:", error)
    return res.status(500).json({ message: "Failed to list mock tests" })
  }
}

/** GET /api/admin/payments */
export const getPaymentsOverview = async (req, res) => {
  try {
    const [usersWithCredits, lowCredits, totalHeld] = await Promise.all([
      UserModel.countDocuments({ credits: { $gt: 0 } }),
      UserModel.countDocuments({ credits: { $lt: 10 } }),
      UserModel.aggregate([{ $group: { _id: null, sum: { $sum: "$credits" } } }]),
    ])

    return res.json({
      usersWithCredits,
      lowCreditUsers: lowCredits,
      totalCreditsInCirculation: totalHeld[0]?.sum || 0,
      noteGenerationCost: 10,
      mockTestCost: 0,
      stripePlans: [
        { amountInr: 100, credits: 50 },
        { amountInr: 200, credits: 120 },
        { amountInr: 500, credits: 300 },
      ],
      message:
        "Transaction history is not stored locally. Use Stripe Dashboard for payments and refunds.",
      refundsSupported: false,
    })
  } catch (error) {
    console.error("getPaymentsOverview:", error)
    return res.status(500).json({ message: "Failed to load payments overview" })
  }
}

/** Announcements */
export const listAnnouncements = async (req, res) => {
  try {
    const items = await Announcement.find().sort({ createdAt: -1 }).limit(100).lean()
    return res.json({ items })
  } catch (error) {
    return res.status(500).json({ message: "Failed to list announcements" })
  }
}

export const createAnnouncement = async (req, res) => {
  try {
    const { title, body, type = "info", published = true } = req.body
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "Title and body are required" })
    }
    const item = await Announcement.create({
      title: title.trim(),
      body: body.trim(),
      type,
      published: !!published,
      createdBy: req.adminEmail,
    })
    await writeAdminLog({
      action: "announcement_create",
      actorEmail: req.adminEmail,
      targetType: "announcement",
      targetId: item._id,
      req,
    })
    return res.status(201).json(item)
  } catch (error) {
    return res.status(500).json({ message: "Failed to create announcement" })
  }
}

export const deleteAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: "Not found" })
    await writeAdminLog({
      action: "announcement_delete",
      actorEmail: req.adminEmail,
      targetType: "announcement",
      targetId: item._id,
      req,
    })
    return res.json({ message: "Deleted" })
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete announcement" })
  }
}

/** Feedback */
export const listFeedback = async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status && ["new", "read", "replied", "archived"].includes(status)) {
      filter.status = status
    }
    const items = await Feedback.find(filter).sort({ createdAt: -1 }).limit(200).lean()
    const counts = await Feedback.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    return res.json({
      items,
      counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to list feedback" })
  }
}

export const createFeedback = async (req, res) => {
  try {
    const { name, email, message, subject } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" })
    }
    const item = await Feedback.create({
      name: name || "",
      email: email || "",
      subject: subject || "General",
      message: message.trim(),
      source: "admin",
    })
    await writeAdminLog({
      action: "feedback_create",
      actorEmail: req.adminEmail,
      targetType: "feedback",
      targetId: item._id,
      req,
    })
    return res.status(201).json(item)
  } catch (error) {
    return res.status(500).json({ message: "Failed to create feedback" })
  }
}

/** Notifications */
export const listNotificationsAdmin = async (req, res) => {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).limit(100).lean()
    return res.json({ items })
  } catch (error) {
    return res.status(500).json({ message: "Failed to list notifications" })
  }
}

export const createNotification = async (req, res) => {
  try {
    const { title, body, type = "info", published = true, audience = "dashboard", link = "" } =
      req.body
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "Title and body are required" })
    }
    const item = await Notification.create({
      title: title.trim(),
      body: body.trim(),
      type,
      published: !!published,
      audience,
      link: String(link || "").trim(),
      createdBy: req.adminEmail,
    })
    await writeAdminLog({
      action: "notification_create",
      actorEmail: req.adminEmail,
      targetType: "notification",
      targetId: item._id,
      req,
    })
    return res.status(201).json(item)
  } catch (error) {
    return res.status(500).json({ message: "Failed to create notification" })
  }
}

export const updateNotification = async (req, res) => {
  try {
    const { title, body, type, published, audience, link } = req.body
    const update = {}
    if (title != null) update.title = String(title).trim()
    if (body != null) update.body = String(body).trim()
    if (type != null) update.type = type
    if (published != null) update.published = !!published
    if (audience != null) update.audience = audience
    if (link != null) update.link = String(link).trim()

    const item = await Notification.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
    if (!item) return res.status(404).json({ message: "Not found" })

    await writeAdminLog({
      action: "notification_update",
      actorEmail: req.adminEmail,
      targetType: "notification",
      targetId: item._id,
      req,
    })
    return res.json(item)
  } catch (error) {
    return res.status(500).json({ message: "Failed to update notification" })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const item = await Notification.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: "Not found" })
    await writeAdminLog({
      action: "notification_delete",
      actorEmail: req.adminEmail,
      targetType: "notification",
      targetId: item._id,
      req,
    })
    return res.json({ message: "Deleted" })
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete notification" })
  }
}

/** Subscriptions / credit-plan overview */
export const getSubscriptions = async (req, res) => {
  try {
    const [totalUsers, freeTier, starterTier, plusTier, proTier, lowCredits, recentUsers] =
      await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ credits: { $lte: 50 } }),
        UserModel.countDocuments({ credits: { $gt: 50, $lte: 100 } }),
        UserModel.countDocuments({ credits: { $gt: 100, $lte: 200 } }),
        UserModel.countDocuments({ credits: { $gt: 200 } }),
        UserModel.countDocuments({ credits: { $lt: 10 } }),
        UserModel.find()
          .select("name email credits status createdAt updatedAt")
          .sort({ credits: -1 })
          .limit(40)
          .lean(),
      ])

    const notesLast30 = await Notes.countDocuments({
      createdAt: { $gte: daysAgo(30) },
    })

    return res.json({
      plans: CREDIT_PLANS,
      tiers: {
        free: freeTier,
        starter: starterTier,
        plus: plusTier,
        pro: proTier,
      },
      totalUsers,
      lowCreditUsers: lowCredits,
      notesLast30,
      estimatedNotesCapacity: Math.floor(
        ((await UserModel.aggregate([{ $group: { _id: null, sum: { $sum: "$credits" } } }]))[0]
          ?.sum || 0) / 10
      ),
      subscribers: recentUsers.map((u) => ({
        ...u,
        planHint:
          u.credits > 200
            ? "Pro-like"
            : u.credits > 100
              ? "Plus-like"
              : u.credits > 50
                ? "Starter-like"
                : "Free",
      })),
      note: "Stripe purchases are not stored locally — tiers are inferred from current credit balances.",
    })
  } catch (error) {
    console.error("getSubscriptions:", error)
    return res.status(500).json({ message: "Failed to load subscriptions" })
  }
}

export const updateFeedback = async (req, res) => {
  try {
    const { status, reply } = req.body
    const update = {}
    if (status) update.status = status
    if (typeof reply === "string") update.reply = reply
    const item = await Feedback.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
    if (!item) return res.status(404).json({ message: "Not found" })
    await writeAdminLog({
      action: "feedback_update",
      actorEmail: req.adminEmail,
      targetType: "feedback",
      targetId: item._id,
      meta: { status: item.status },
      req,
    })
    return res.json(item)
  } catch (error) {
    return res.status(500).json({ message: "Failed to update feedback" })
  }
}

export const deleteFeedback = async (req, res) => {
  try {
    const item = await Feedback.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: "Not found" })
    await writeAdminLog({
      action: "feedback_delete",
      actorEmail: req.adminEmail,
      targetType: "feedback",
      targetId: item._id,
      req,
    })
    return res.json({ message: "Deleted" })
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete feedback" })
  }
}

/** Logs */
export const listLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query
    const filter = {}
    if (action) filter.action = action
    const pageNum = Math.max(1, Number(page) || 1)
    const lim = Math.min(200, Math.max(1, Number(limit) || 50))
    const [items, total] = await Promise.all([
      AdminLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .lean(),
      AdminLog.countDocuments(filter),
    ])
    return res.json({ items, total, page: pageNum, limit: lim })
  } catch (error) {
    return res.status(500).json({ message: "Failed to list logs" })
  }
}

/** Global search */
export const globalSearch = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim()
    if (!q || q.length < 2) {
      return res.json({ users: [], notes: [], mockTests: [] })
    }
    const re = { $regex: q, $options: "i" }
    const [users, notes, mockTests] = await Promise.all([
      UserModel.find({ $or: [{ name: re }, { email: re }] })
        .select("name email credits status")
        .limit(8)
        .lean(),
      Notes.find({ topic: re }).select("topic createdAt").limit(8).lean(),
      MockTest.find({ topic: re })
        .select("topic status score createdAt")
        .limit(8)
        .lean(),
    ])
    return res.json({ users, notes, mockTests })
  } catch (error) {
    return res.status(500).json({ message: "Search failed" })
  }
}

/** CSV export */
export const exportReport = async (req, res) => {
  try {
    const type = req.query.type || "users"
    let rows = []
    let filename = "report.csv"

    if (type === "users") {
      const users = await UserModel.find().lean()
      rows = [
        ["id", "name", "email", "credits", "status", "createdAt"],
        ...users.map((u) => [
          u._id,
          u.name,
          u.email,
          u.credits,
          u.status || "active",
          u.createdAt?.toISOString?.() || "",
        ]),
      ]
      filename = "mindovio-users.csv"
    } else if (type === "notes") {
      const notes = await Notes.find().lean()
      rows = [
        ["id", "topic", "classLevel", "examType", "user", "createdAt"],
        ...notes.map((n) => [
          n._id,
          n.topic,
          n.classLevel || "",
          n.examType || "",
          n.user,
          n.createdAt?.toISOString?.() || "",
        ]),
      ]
      filename = "mindovio-notes.csv"
    } else if (type === "mocks") {
      const mocks = await MockTest.find().lean()
      rows = [
        ["id", "topic", "difficulty", "status", "percentage", "user", "createdAt"],
        ...mocks.map((m) => [
          m._id,
          m.topic,
          m.difficulty,
          m.status,
          m.score?.percentage ?? "",
          m.user,
          m.createdAt?.toISOString?.() || "",
        ]),
      ]
      filename = "mindovio-mock-tests.csv"
    } else {
      return res.status(400).json({ message: "Invalid report type" })
    }

    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "")
            return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
          })
          .join(",")
      )
      .join("\n")

    await writeAdminLog({
      action: "report_export",
      actorEmail: req.adminEmail,
      meta: { type, rows: rows.length - 1 },
      req,
    })

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    return res.send(csv)
  } catch (error) {
    console.error("exportReport:", error)
    return res.status(500).json({ message: "Export failed" })
  }
}

/** Settings (non-secret) */
export const getSettings = async (req, res) => {
  return res.json({
    adminEmail: req.adminEmail,
    sessionHours: Number(process.env.ADMIN_SESSION_HOURS) || 8,
    clientUrl: process.env.CLIENT_URL || "",
    nodeEnv: process.env.NODE_ENV || "development",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    mongoConfigured: Boolean(process.env.MONGODB_URL),
    placeholders: {
      smtp: "Configure SMTP in a future release",
      apiKeys: "Manage secrets via host environment variables",
      storage: "Using MongoDB Atlas / local Mongo",
      backups: "Configure backups on your hosting provider",
    },
  })
}
