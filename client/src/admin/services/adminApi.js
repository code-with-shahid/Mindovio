import axios from "axios"
import { serverUrl } from "../../config"
import {
  cachedFetch,
  cacheInvalidate,
  cacheInvalidatePrefix,
  CLIENT_CACHE_TTL,
} from "../../services/cache"

const adminApi = axios.create({
  baseURL: `${serverUrl}/api/admin`,
  withCredentials: true,
})

const adminGet = (path, params, ttl = CLIENT_CACHE_TTL.ADMIN) => {
  const key = `admin:${path}:${JSON.stringify(params || {})}`
  return cachedFetch(key, ttl, () =>
    adminApi.get(path, { params }).then((r) => r.data)
  )
}

const bustAdmin = (...prefixes) => {
  cacheInvalidatePrefix("admin:")
  cacheInvalidatePrefix("public:")
  for (const p of prefixes) cacheInvalidate(p)
}

export const adminLogin = (email, password) =>
  adminApi.post("/login", { email, password }).then((r) => r.data)

/** Soft admin check for the main /login page (non-admin emails return { admin: false }). */
export const tryAdminLogin = (email, password) =>
  adminApi.post("/try-login", { email, password }).then((r) => r.data)

export const adminLogout = () => adminApi.post("/logout").then((r) => r.data)

export const adminMe = () => adminApi.get("/me").then((r) => r.data)

export const fetchStats = () => adminGet("/stats")

export const fetchAnalytics = () => adminGet("/analytics")

export const fetchUsers = (params) => adminGet("/users", params, 20_000)

export const fetchUser = (id) => adminGet(`/users/${id}`, undefined, 20_000)

export const patchUserStatus = (id, body) =>
  adminApi.patch(`/users/${id}/status`, body).then((r) => {
    bustAdmin()
    return r.data
  })

export const patchUserCredits = (id, credits) =>
  adminApi.patch(`/users/${id}/credits`, { credits }).then((r) => {
    bustAdmin()
    return r.data
  })

export const deleteUser = (id) =>
  adminApi.delete(`/users/${id}`).then((r) => {
    bustAdmin()
    return r.data
  })

export const fetchNotes = (params) => adminGet("/notes", params, 20_000)

export const deleteNote = (id) =>
  adminApi.delete(`/notes/${id}`).then((r) => {
    bustAdmin()
    return r.data
  })

export const fetchMockTests = (params) => adminGet("/mock-tests", params, 20_000)

export const fetchPayments = () => adminGet("/payments", undefined, CLIENT_CACHE_TTL.ADMIN)

export const fetchAnnouncements = () => adminGet("/announcements")

export const createAnnouncement = (body) =>
  adminApi.post("/announcements", body).then((r) => {
    bustAdmin("public:announcements")
    return r.data
  })

export const deleteAnnouncement = (id) =>
  adminApi.delete(`/announcements/${id}`).then((r) => {
    bustAdmin("public:announcements")
    return r.data
  })

export const fetchFeedback = (params) => adminGet("/feedback", params, 20_000)

export const createFeedback = (body) =>
  adminApi.post("/feedback", body).then((r) => {
    bustAdmin()
    return r.data
  })

export const updateFeedback = (id, body) =>
  adminApi.patch(`/feedback/${id}`, body).then((r) => {
    bustAdmin()
    return r.data
  })

export const deleteFeedback = (id) =>
  adminApi.delete(`/feedback/${id}`).then((r) => {
    bustAdmin()
    return r.data
  })

export const fetchNotifications = () => adminGet("/notifications")

export const createNotification = (body) =>
  adminApi.post("/notifications", body).then((r) => {
    bustAdmin("public:notifications")
    return r.data
  })

export const updateNotification = (id, body) =>
  adminApi.patch(`/notifications/${id}`, body).then((r) => {
    bustAdmin("public:notifications")
    return r.data
  })

export const deleteNotification = (id) =>
  adminApi.delete(`/notifications/${id}`).then((r) => {
    bustAdmin("public:notifications")
    return r.data
  })

export const fetchSubscriptions = () => adminGet("/subscriptions")

export const fetchLogs = (params) => adminGet("/logs", params, 15_000)

export const searchAdmin = (q) =>
  adminGet("/search", { q }, CLIENT_CACHE_TTL.ADMIN_SEARCH)

export const fetchSettings = () =>
  adminGet("/settings", undefined, CLIENT_CACHE_TTL.ADMIN)

export const exportReport = async (type) => {
  const res = await adminApi.get("/reports/export", {
    params: { type },
    responseType: "blob",
  })
  return res.data
}

export const exportReportUrl = (type) =>
  `${serverUrl}/api/admin/reports/export?type=${encodeURIComponent(type)}`

export default adminApi
