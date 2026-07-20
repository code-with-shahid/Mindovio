import api from "./http"
import { setUserData } from "../redux/userSlice"
import { fetchBackendUser } from "./auth.service"

export const getCurrentUser = async (dispatch) => {
  const user = await fetchBackendUser()
  dispatch(setUserData(user))
}

export const generateNotes = async (payload) => {
  const result = await api.post("/api/notes/generate-notes", payload)
  return result.data
}

export const downloadPdf = async (result) => {
  const response = await api.post(
    "/api/pdf/generate-pdf",
    { result },
    { responseType: "blob" }
  )
  const blob = new Blob([response.data], { type: "application/pdf" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "Mindovio.pdf"
  link.click()
  window.URL.revokeObjectURL(url)
}

export const generateMockTest = async (payload) => {
  const result = await api.post("/api/mock-tests/generate", payload)
  return result.data
}

export const getMockTest = async (testId) => {
  const result = await api.get(`/api/mock-tests/${testId}`)
  return result.data
}

export const startMockTest = async (testId) => {
  const result = await api.post(`/api/mock-tests/${testId}/start`, {})
  return result.data
}

export const submitMockTest = async (testId, payload) => {
  const result = await api.post(`/api/mock-tests/${testId}/submit`, payload)
  return result.data
}

export const listMockTests = async () => {
  const result = await api.get("/api/mock-tests")
  return result.data
}

export const fetchPublishedAnnouncements = async () => {
  const result = await api.get("/api/announcements")
  return result.data
}

export const fetchPublishedNotifications = async () => {
  const result = await api.get("/api/notifications")
  return result.data
}

export const submitFeedback = async (payload) => {
  const result = await api.post("/api/feedback", payload)
  return result.data
}
