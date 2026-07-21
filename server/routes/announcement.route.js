import express from "express"
import Announcement from "../models/announcement.model.js"
import { cacheAside, CACHE_KEYS, CACHE_TTL } from "../utils/cache.js"

const announcementRouter = express.Router()

/** Public — published announcements for student/landing UI */
announcementRouter.get("/", async (req, res) => {
  try {
    const items = await cacheAside(CACHE_KEYS.PUBLIC_ANNOUNCEMENTS, CACHE_TTL.PUBLIC, async () =>
      Announcement.find({ published: true })
        .select("title body type createdAt")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    )
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120")
    return res.json({ items })
  } catch (error) {
    console.error("listPublishedAnnouncements:", error)
    return res.status(500).json({ message: "Failed to load announcements" })
  }
})

export default announcementRouter
