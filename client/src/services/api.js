import api from "./http"
import { setUserData } from "../redux/userSlice"
import { fetchBackendUser } from "./auth.service"
import {
  cachedFetch,
  cacheInvalidate,
  cacheInvalidatePrefix,
  cacheSet,
  CLIENT_CACHE_TTL,
} from "./cache"

export const getCurrentUser = async (dispatch) => {
  const user = await fetchBackendUser()
  dispatch(setUserData(user))
}

export const generateNotes = async (payload) => {
  const result = await api.post("/api/notes/generate-notes", payload)
  cacheInvalidatePrefix("notes:")
  cacheInvalidatePrefix("admin:")
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
  cacheInvalidatePrefix("mocks:")
  cacheInvalidatePrefix("admin:")
  return result.data
}

export const getMockTest = async (testId) => {
  // Never cache in-progress / pending-feedback polls — always fresh from network
  const result = await api.get(`/api/mock-tests/${testId}`)
  const data = result.data
  if (data?.status === "submitted" && data?.feedbackStatus !== "pending") {
    cacheSet(`mocks:detail:${testId}`, data, CLIENT_CACHE_TTL.MOCK_DETAIL)
  }
  return data
}

export const startMockTest = async (testId) => {
  const result = await api.post(`/api/mock-tests/${testId}/start`, {})
  cacheInvalidate(`mocks:detail:${testId}`)
  cacheInvalidatePrefix("mocks:list")
  return result.data
}

export const submitMockTest = async (testId, payload) => {
  const result = await api.post(`/api/mock-tests/${testId}/submit`, payload)
  cacheInvalidate(`mocks:detail:${testId}`)
  cacheInvalidatePrefix("mocks:list")
  return result.data
}

export const listMockTests = async () => {
  return cachedFetch("mocks:list", CLIENT_CACHE_TTL.MOCK_LIST, async () => {
    const result = await api.get("/api/mock-tests")
    return result.data
  })
}

export const fetchMyNotes = async () => {
  return cachedFetch("notes:list", CLIENT_CACHE_TTL.NOTES_LIST, async () => {
    const result = await api.get("/api/notes/getnotes")
    return result.data
  })
}

export const fetchNoteById = async (noteId) => {
  return cachedFetch(`notes:detail:${noteId}`, CLIENT_CACHE_TTL.NOTE_DETAIL, async () => {
    const result = await api.get(`/api/notes/${noteId}`)
    return result.data
  })
}

export const fetchPublishedAnnouncements = async () => {
  return cachedFetch("public:announcements", CLIENT_CACHE_TTL.PUBLIC, async () => {
    const result = await api.get("/api/announcements")
    return result.data
  })
}

export const fetchPublishedNotifications = async () => {
  return cachedFetch("public:notifications", CLIENT_CACHE_TTL.PUBLIC, async () => {
    const result = await api.get("/api/notifications")
    return result.data
  })
}

export const submitFeedback = async (payload) => {
  const result = await api.post("/api/feedback", payload)
  return result.data
}
