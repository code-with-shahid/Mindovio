import express from "express"
import Notification from "../models/notification.model.js"

const notificationRouter = express.Router()

/** Public — published in-app notifications */
notificationRouter.get("/", async (req, res) => {
  try {
    const items = await Notification.find({ published: true })
      .select("title body type audience link createdAt")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()
    return res.json({ items })
  } catch (error) {
    console.error("listPublishedNotifications:", error)
    return res.status(500).json({ message: "Failed to load notifications" })
  }
})

export default notificationRouter
