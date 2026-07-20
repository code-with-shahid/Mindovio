import express from "express"
import dotenv from "dotenv"
import connectDb from "./utils/connectDb.js"
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.route.js"
import notesRouter from "./routes/genrate.route.js"
import pdfRouter from "./routes/pdf.route.js"
import creditRouter from "./routes/credits.route.js"
import mockTestRouter from "./routes/mockTest.route.js"
import adminRouter from "./routes/admin.route.js"
import announcementRouter from "./routes/announcement.route.js"
import feedbackRouter from "./routes/feedback.route.js"
import notificationRouter from "./routes/notification.route.js"
import { stripeWebhook } from "./controllers/credits.controller.js"
dotenv.config()




const app = express()

app.post(
  "/api/credits/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

const allowedOrigins = [
  ...(process.env.CORS_ORIGINS || "").split(","),
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
]
  .map((origin) => (origin || "").trim())
  .filter(Boolean)
  .filter((origin, index, list) => list.indexOf(origin) === index)

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (no Origin) and allowlisted Vite/dev URLs
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
)



app.use(express.json())
app.use(cookieParser())
const PORT = process.env.PORT || 5000
app.get("/",(req,res)=>{
    res.json({ message: "Mindovio Backend Running" })

})
app.use("/api/auth" , authRouter)
app.use("/api/user", userRouter)
app.use("/api/notes", notesRouter)
app.use("/api/pdf", pdfRouter)
app.use("/api/credit",creditRouter)
app.use("/api/mock-tests", mockTestRouter)
app.use("/api/announcements", announcementRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/admin", adminRouter)

app.listen(PORT,()=>{
    console.log(`✅ Server running on port ${PORT}`)
    connectDb()
})