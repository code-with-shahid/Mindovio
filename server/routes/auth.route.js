import express from "express"
import { googleAuth, logOut, syncSession } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/session", syncSession)
authRouter.post("/google", googleAuth)
authRouter.get("/logout", logOut)

export default authRouter
