import express from "express"
import Notification from "../models/notification.model.js"
import { cacheAside, CACHE_KEYS, CACHE_TTL } from "../utils/cache.js"

const notificationRouter = express.Router()

/** Public — published in-app notifications */
notificationRouter.get("/", async (req, res) => {
  try {
    const items = await cacheAside(CACHE_KEYS.PUBLIC_NOTIFICATIONS, CACHE_TTL.PUBLIC, async () =>
      Notification.find({ published: true })
        .select("title body type audience link createdAt")
        .sort({ createdAt: -1 })
        .limit(30)
        .lean()
    )
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120")
    return res.json({ items })
  } catch (error) {
    console.error("listPublishedNotifications:", error)
    return res.status(500).json({ message: "Failed to load notifications" })
  }
})

export default notificationRouter
