import express from "express"
import isAuth from "../middleware/isAuth.js"
import {
  generateMockTest,
  getMockTest,
  startMockTest,
  submitMockTest,
  listMockTests,
} from "../controllers/mockTest.controller.js"

const mockTestRouter = express.Router()

mockTestRouter.get("/", isAuth, listMockTests)
mockTestRouter.post("/generate", isAuth, generateMockTest)
mockTestRouter.get("/:id", isAuth, getMockTest)
mockTestRouter.post("/:id/start", isAuth, startMockTest)
mockTestRouter.post("/:id/submit", isAuth, submitMockTest)

export default mockTestRouter
