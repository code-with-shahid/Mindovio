import express from "express"
import Announcement from "../models/announcement.model.js"

const announcementRouter = express.Router()

/** Public — published announcements for student/landing UI */
announcementRouter.get("/", async (req, res) => {
  try {
    const items = await Announcement.find({ published: true })
      .select("title body type createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    return res.json({ items })
  } catch (error) {
    console.error("listPublishedAnnouncements:", error)
    return res.status(500).json({ message: "Failed to load announcements" })
  }
})

export default announcementRouter
